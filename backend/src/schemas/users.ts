import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import Role from "../types/role";
import User, { PaginatedUsers, UserInput } from "../types/user";
import logger from "../utils/logger";
import { CalculatePages } from "../utils/paginating";
import bcrypt from "bcrypt";
import Yup from "../configs/yup";

@Resolver()
export default class Users {
  unknowRecordMessage: string = "Usuário não foi encontrado.";

  @Query(() => PaginatedUsers)
  async users(
    @Arg("page", () => Int, { nullable: true }) page: number = 1,
    @Arg("perPage", () => Int, { nullable: true }) perPage: number = 15,
    @Arg("sortBy", { nullable: true }) sortBy: string = "createdAt",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = -1,
    @Arg("filterByName", { nullable: true }) filterByName: string,
    @Arg("filterBySurname", { nullable: true }) filterBySurname: string,
    @Arg("filterByEmail", { nullable: true }) filterByEmail: string,
    @Arg("filterByDocument", { nullable: true }) filterByDocument: string,
    @Ctx() ctx?: Context
  ): Promise<PaginatedUsers> {
    ctx && (await ctx.hasPermission(policies.users));

    try {
      let where = {};

      if (filterByName?.trim())
        where = {
          ...where,
          name: { $regex: new RegExp(filterByName.trim()), $options: "i" },
        };
      if (filterBySurname?.trim())
        where = {
          ...where,
          surname: {
            $regex: new RegExp(filterBySurname.trim()),
            $options: "i",
          },
        };
      if (filterByEmail?.trim())
        where = {
          ...where,
          email: { $regex: new RegExp(filterByEmail.trim()), $options: "i" },
        };
      if (filterByDocument?.trim())
        where = {
          ...where,
          document: {
            $eq:
              filterByDocument.trim().replace(/\D/gm, "") ||
              Math.floor(Math.random() * 30 * 24 * 365),
          },
        };

      const user = ctx && (await ctx.getUser());
      if (!user.isSuperAdmin) where = { ...where, isSuperAdmin: false };

      const total = await User.count({ where });
      const pagination = new CalculatePages(page, perPage, total);

      let list = await User.find({
        where,
        take: pagination.perPage,
        skip: pagination.offset,
        order: { [sortBy]: sortDir },
      });

      if (list.length) {
        for (let model of list) {
          model.roles = [];
          if (model.roleIds.length) {
            for (const roleId of model.roleIds) {
              const role = await Role.findOne(roleId);
              if (role) model.roles.push(role);
            }
          }
        }
      }

      return new PaginatedUsers(
        pagination.total,
        pagination.pages,
        pagination.perPage,
        pagination.currentPage,
        list
      );
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => [User])
  async usersDropdown(@Ctx() ctx?: Context): Promise<User[] | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      return await User.find({
        order: { name: 1 },
      });
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => User)
  async user(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(policies.user));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await User.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      model.roles = [];
      if (model.roleIds.length) {
        for (const roleId of model.roleIds) {
          const role = await Role.findOne(roleId);
          if (role) model.roles.push(role);
        }
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async createUser(
    @Arg("data") data: UserInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(policies.createUser));

    try {
      data.email = data.email.toLowerCase().trim();

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        surname: Yup.string().required(),
        email: Yup.string().required(),
        password: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await User.count({
        email: data.email,
      });
      if (has) throw new Error("Já existe um usuário com este e-mail.");

      let model = new User();

      if (ctx && !ctx.isSuperAdmin && data?.isSuperAdmin === true)
        throw new Error(
          "Somente um super-administrador pode criar outro super-administrador."
        );

      if (data.document.trim()) {
        let document = data.document.trim().replace(/\D/gm, "");
        data.document = document;
      }

      if (data.password?.trim()) {
        const salt = bcrypt.genSaltSync(10);
        model.password = bcrypt.hashSync(data.password.trim(), salt);
      } else {
        throw new Error("Senha é obrigatória.");
      }
      delete data.password;

      const roles = [];
      if (data.roles?.length) {
        model.roleIds = [];
        for (const roleId of data.roles) {
          const role = await Role.findOne(roleId);
          if (role) model.roleIds.push(role.id.toString());
        }
        delete data.roles;
      }
      if (model.roleIds.length) {
        for (const roleId of model.roleIds) {
          const role = await Role.findOne(roleId);
          if (role) roles.push(role);
        }
      }

      await model.save();
      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      model.roles = roles;

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: UserInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(policies.updateUser));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await User.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        surname: Yup.string().required(),
        email: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      if (ctx && !ctx.isSuperAdmin && data?.isSuperAdmin === true)
        throw new Error(
          "Somente um super-administrador pode criar outro super-administrador."
        );

      if (data.document?.trim()) {
        let document = data.document.trim().replace(/\D/gm, "");
        data.document = document;
      }

      if (data.password?.trim()) {
        const salt = bcrypt.genSaltSync(10);
        model.password = bcrypt.hashSync(data.password.trim(), salt);
      }
      delete data.password;

      const roles = [];
      if (data.roles?.length) {
        model.roleIds = [];
        for (const roleId of data.roles) {
          const role = await Role.findOne(roleId);
          if (role) model.roleIds.push(role.id.toString());
        }
        delete data.roles;
      }
      if (model.roleIds.length) {
        for (const roleId of model.roleIds) {
          const role = await Role.findOne(roleId);
          if (role) roles.push(role);
        }
      }

      model = Object.assign(model, data);
      await model.save();

      model.roles = roles;

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async deleteUser(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteUser));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await User.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const roles = [];
      if (model.roleIds.length) {
        for (const roleId of model.roleIds) {
          const role = await Role.findOne(roleId);
          if (role) {
            roles.push(role);
          }
        }
      }
      model.roles = roles;

      await model.softRemove();

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
