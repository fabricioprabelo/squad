import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { SORT_DESCRIPTION } from "../configs/constants";
import Context from "../support/Context";
import Role from "../types/Role";
import User, { PaginatedUsers, UserInput } from "../types/User";
import { CalculatePages } from "../support/Paginating";
import bcrypt from "bcrypt";
import Yup from "../configs/yup";
import claims from "../configs/claims";
import Logger from "../support/Logger";
import UsersRepository from "../repositories/UsersRepository";
import { getCustomRepository } from "typeorm";

@Resolver()
export default class Users {
  usersRepository: UsersRepository;
  unknowRecordMessage: string = "Usuário não foi encontrado.";

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  }

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
    ctx && (await ctx.hasPermission(claims.users));

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

      return await this.usersRepository.getEntitiesPagination(
        page,
        perPage,
        sortBy,
        sortDir,
        where
      );
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Query(() => [User])
  async usersDropdown(@Ctx() ctx?: Context): Promise<User[] | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      return await this.usersRepository.getEntities({
        order: { name: 1 },
      });
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Query(() => User)
  async user(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(claims.user));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.usersRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async createUser(
    @Arg("data") data: UserInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(claims.createUser));

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

      const has = await this.usersRepository.entityExists({
        where: { email: data.email },
      });
      if (has) throw new Error("Já existe um usuário com este e-mail.");

      if (ctx && !ctx.isSuperAdmin && data?.isSuperAdmin === true)
        throw new Error(
          "Somente um super-administrador pode criar outro super-administrador."
        );

      if (!data.password?.trim()) {
        throw new Error("Senha é obrigatória.");
      }

      const model = this.usersRepository.createEntity(data);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: UserInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(claims.updateUser));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await this.usersRepository.getEntityById(id);
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

      await this.usersRepository.updateEntity(model, data);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async deleteUser(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(claims.deleteUser));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.usersRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await this.usersRepository.deleteEntity(model);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async softDeleteUser(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(claims.deleteUser));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.usersRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await this.usersRepository.softDeleteEntity(model);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async restoreUser(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.hasPermission(claims.deleteUser));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.usersRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await this.usersRepository.restoreEntity(model);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }
}
