import {
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  ObjectID,
  ObjectLiteral,
} from "typeorm";

export interface IBaseRepository<Entity, EntityInput> {
  createEntity(data: EntityInput): Promise<Entity>;
  updateEntity(model: Entity, data: EntityInput): Promise<Entity>;
  deleteEntity(model: Entity): Promise<Entity>;
  getEntities(options?: FindManyOptions<Entity>): Promise<Entity[]>;
  getEntity(
    conditions?: FindConditions<Entity>,
    options?: FindOneOptions<Entity>
  ): Promise<Entity>;
  getEntityById(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Entity>
  ): Promise<Entity>;
  entityExists(conditions?: FindManyOptions<Entity>): Promise<boolean>;
}

export interface ISoftDeleteRepository<Entity, EntityInput>
  extends IBaseRepository<Entity, EntityInput> {
  softDeleteEntity(model: Entity): Promise<Entity>;
  restoreEntity(model: Entity): Promise<Entity>;
}

export interface IEntityPagination<Entity, EntityPagination> {
  getEntitiesPagination(
    page: number,
    perPage: number,
    sortBy: string,
    sortDir: number,
    where?: FindConditions<Entity>
  ): Promise<EntityPagination>;
}
