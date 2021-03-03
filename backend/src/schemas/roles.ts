import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { SORT_DESCRIPTION } from "../configs/constants";
import Context from "../support/Context";
import Role, { PaginatedRoles, RoleInput } from "../types/Role";
import Yup from "../configs/yup";
import claims from "../configs/claims";
import Logger from "../support/Logger";
import RolesRepository from "../repositories/RolesRepository";
import { getCustomRepository } from "typeorm";

@Resolver()
export default class Roles {
  rolesRepository: RolesRepository;
  unknowRecordMessage: string = "Regra não foi encontrada.";

  constructor() {
    this.rolesRepository = getCustomRepository(RolesRepository);
  }

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
    ctx && (await ctx.hasPermission(claims.roles));

    try {
      await this.rolesRepository.getEntitiesPagination(
        page,
        perPage,
        sortBy,
        sortDir
      );
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Query(() => [Role])
  async rolesDropdown(@Ctx() ctx?: Context): Promise<Role[] | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      return this.rolesRepository.getEntities({
        order: { name: 1 },
      });
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Query(() => Role)
  async role(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(claims.role));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.rolesRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => Role)
  async createRole(
    @Arg("data") data: RoleInput,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(claims.createRole));

    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        description: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await this.rolesRepository.entityExists({
        name: data.name?.trim()?.toLowerCase(),
      });
      if (has) throw new Error("Já existe uma regra com este nome.");

      const model = await this.rolesRepository.createEntity(data);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => Role)
  async updateRole(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: RoleInput,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(claims.updateRole));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await this.rolesRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        description: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      await this.rolesRepository.updateEntity(model, data);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => Role)
  async deleteRole(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Role | undefined> {
    ctx && (await ctx.hasPermission(claims.deleteRole));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.rolesRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await this.rolesRepository.deleteEntity(model);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }
}
