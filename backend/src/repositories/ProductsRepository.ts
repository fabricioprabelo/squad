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
import Product, { PaginatedProducts, ProductInput } from "../types/Product";

@EntityRepository(Product)
class ProductsRepository
  extends Repository<Product>
  implements
    IBaseRepository<Product, ProductInput>,
    IEntityPagination<Product, PaginatedProducts> {
  async getEntitiesPagination(
    page: number,
    perPage: number,
    sortBy: string,
    sortDir: number,
    where?: FindConditions<Product>
  ): Promise<PaginatedProducts> {
    const total = await this.count(where);
    const pagination = new CalculatePages(page, perPage, total);

    const list = await this.getEntities({
      where,
      take: pagination.perPage,
      skip: pagination.offset,
      order: { [sortBy]: sortDir },
    });

    return new PaginatedProducts(
      pagination.total,
      pagination.pages,
      pagination.perPage,
      pagination.currentPage,
      list
    );
  }

  async createEntity(data: ProductInput): Promise<Product> {
    let model = new Product();
    model = Object.assign(model, data);
    await model.save();

    return model;
  }

  async updateEntity(model: Product, data: ProductInput): Promise<Product> {
    model = Object.assign(model, data);
    await model.save();

    return model;
  }

  async deleteEntity(model: Product): Promise<Product> {
    await Product.delete(model.id);

    return model;
  }

  async getEntities(options?: FindManyOptions<Product>): Promise<Product[]> {
    return await Product.find(options);
  }

  async getEntity(
    conditions?: FindConditions<Product>,
    options?: FindOneOptions<Product>
  ): Promise<Product> {
    return await Product.findOne(conditions, options);
  }

  async getEntityById(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<Product>
  ): Promise<Product> {
    return await Product.findOne(id, options);
  }

  async entityExists(conditions?: FindManyOptions<Product>): Promise<boolean> {
    const count = await Product.count(conditions);
    return !!count;
  }
}

export default ProductsRepository;
