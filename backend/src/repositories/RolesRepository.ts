import slugify from "slugify";
import {
  EntityRepository,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  ObjectID,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { IBaseRepository, IEntityPagination } from ".";
import { CalculatePages } from "../support/Paginating";
import Role, { PaginatedRoles, RoleInput } from "../types/Role";

@EntityRepository(Role)
class RolesRepository
  extends Repository<Role>
  implements
    IBaseRepository<Role, RoleInput>,
    IEntityPagination<Role, PaginatedRoles> {
  async getEntitiesPagination(
    page: number,
    perPage: number,
    sortBy: string,
    sortDir: number,
    where?: FindConditions<Role>
  ): Promise<PaginatedRoles> {
    const total = await this.count(where);
    const pagination = new CalculatePages(page, perPage, total);

    const list = await this.getEntities({
      where,
      take: pagination.perPage,
      skip: pagination.offset,
      order: { [sortBy]: sortDir },
    });

    return new PaginatedRoles(
      pagination.total,
      pagination.pages,
      pagination.perPage,
      pagination.currentPage,
      list
    );
  }

  async createEntity(data: RoleInput): Promise<Role> {
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

    return model;
  }

  async updateEntity(model: Role, data: RoleInput): Promise<Role> {
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

    return model;
  }

  async deleteEntity(model: Role): Promise<Role> {
    if (model.name === "admin" || model.name === "common")
      throw new Error("Não é possível remover uma regra padrão.");

    await Role.delete(model.id);

    return model;
  }

  async getEntities(options?: FindManyOptions<Role>): Promise<Role[]> {
    return await Role.find(options);
  }

  async getEntity(
    conditions?: FindConditions<Role>,
    options?: FindOneOptions<Role>
  ): Promise<Role> {
    return await Role.findOne(conditions, options);
  }

  async getEntityById(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Role>
  ): Promise<Role> {
    return await Role.findOne(id, options);
  }

  async entityExists(conditions?: FindManyOptions<Role>): Promise<boolean> {
    const count = await Role.count(conditions);
    return !!count;
  }
}

export default RolesRepository;
