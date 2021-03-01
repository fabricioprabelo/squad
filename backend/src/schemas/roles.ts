import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import Role, { PaginatedRoles, RoleInput } from "../types/role";
import logger from "../utils/logger";
import slugify from "slugify";
import { CalculatePages } from "../utils/paginating";
import Yup from "../configs/yup";
import User from "../types/user";

@Resolver()
export default class Roles {
  unknowRecordMessage: string = "Regra não foi encontrada.";

  @Query(() => PaginatedRoles)
  async roles(
    @Arg("page", () => Int, { nullable: true }) page: number = 1,
    @Arg("perPage", () => Int, { nullable: true }) perPage: number = 15,
    @Arg("sortBy", { nullable: true }) sortBy: string = "name",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Ctx() ctx?: Context
  ): Promise<PaginatedRoles> {
    ctx && (await ctx.hasPermission(policies.roles));

    try {
      const total = await Role.count();
      const pagination = new CalculatePages(page, perPage, total);

      let list = await Role.find({
        take: pagination.perPage,
        skip: pagination.offset,
        order: { [sortBy]: sortDir },
      });

      if (list.length) {
        for (let model of list) {
          const users = await User.find({
            where: {
              roleIds: { $in: [model.id.toString()] },
            },
          });
          model.users =
            users?.map((user) => {
              user.roles = [];
              user.roles.push(model);
              return user;
            }) || [];
        }
      }

      return new PaginatedRoles(
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

  @Query(() => [Role])
  async rolesDropdown(@Ctx() ctx?: Context): Promise<Role[] | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      return await Role.find({
        order: { name: 1 },
      });
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => Role)
  async role(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(policies.role));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Role.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const users = await User.find({
        where: {
          roleIds: { $in: [model.id.toString()] },
        },
      });
      model.users = users?.map((user) => {
        user.roles = [];
        user.roles.push(model) || [];

        return user;
      });

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Role)
  async createRole(
    @Arg("data") data: RoleInput,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(policies.createRole));

    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        description: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await Role.count({
        name: data.name?.trim()?.toLowerCase(),
      });
      if (has) throw new Error("Já existe uma regra com este nome.");

      let model = new Role();

      data.name = slugify(data.name, {
        replacement: "-", // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
        locale: "pt", // language code of the locale to use
      });

      model = Object.assign(model, data);
      await model.save();

      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      const users = await User.find({
        where: {
          roleIds: { $in: [model.id.toString()] },
        },
      });
      model.users =
        users?.map((user) => {
          user.roles = [];
          user.roles.push(model);
          return user;
        }) || [];

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Role)
  async updateRole(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: RoleInput,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(policies.updateRole));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await Role.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        description: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      if (model.name !== "admin" && model.name !== "common") {
        data.name = slugify(data.name, {
          replacement: "-", // replace spaces with replacement character, defaults to `-`
          remove: undefined, // remove characters that match regex, defaults to `undefined`
          lower: true, // convert to lower case, defaults to `false`
          strict: true, // strip special characters except replacement, defaults to `false`
          locale: "pt", // language code of the locale to use
        });
      }

      model = Object.assign(model, data);
      await model.save();

      const users = await User.find({
        where: {
          roleIds: { $in: [model.id.toString()] },
        },
      });
      model.users =
        users?.map((user) => {
          user.roles = [];
          user.roles.push(model);
          return user;
        }) || [];

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Role)
  async deleteRole(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteRole));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Role.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      if (model.name === "admin" || model.name === "common")
        throw new Error("Não é possível remover uma regra padrão.");

      const users = await User.find({
        where: {
          roleIds: { $in: [model.id.toString()] },
        },
      });
      model.users =
        users?.map((user) => {
          user.roles = [];
          user.roles.push(model);
          return user;
        }) || [];

      await Role.delete(id);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
