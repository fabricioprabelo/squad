import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { SORT_DESCRIPTION } from "../configs/constants";
import Context from "../support/Context";
import Product, { PaginatedProducts, ProductInput } from "../types/Product";
import Yup from "../configs/yup";
import claims from "../configs/claims";
import Logger from "../support/Logger";
import ProductsRepository from "../repositories/ProductsRepository";
import { getCustomRepository } from "typeorm";

@Resolver()
export default class Products {
  productsRepository: ProductsRepository;
  unknowRecordMessage: string = "Produto não foi encontrado.";

  constructor() {
    this.productsRepository = getCustomRepository(ProductsRepository);
  }

  @Query(() => PaginatedProducts)
  async products(
    @Arg("page", () => Int, { nullable: true }) page: number = 1,
    @Arg("perPage", () => Int, { nullable: true }) perPage: number = 15,
    @Arg("sortBy", { nullable: true }) sortBy: string = "createdAt",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = -1,
    @Arg("filterByName", { nullable: true }) filterByName: string,
    @Ctx() ctx?: Context
  ): Promise<PaginatedProducts> {
    ctx && (await ctx.hasPermission(claims.products));

    try {
      let where = {};

      if (filterByName?.trim())
        where = {
          ...where,
          name: { $regex: new RegExp(filterByName.trim()), $options: "i" },
        };

      return await this.productsRepository.getEntitiesPagination(
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

  @Query(() => Product)
  async product(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Product | undefined> {
    ctx && (await ctx.hasPermission(claims.product));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.productsRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => Product)
  async createProduct(
    @Arg("data") data: ProductInput,
    @Ctx() ctx?: Context
  ): Promise<Product | undefined> {
    ctx && (await ctx.hasPermission(claims.createProduct));

    try {
      data.name = data.name.trim();

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        description: Yup.string(),
        price: Yup.number().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await this.productsRepository.entityExists({
        where: {
          name: { $regex: new RegExp(data.name.trim()), $options: "i" },
        },
      });
      if (has) throw new Error("Já existe um produto com este nome.");

      const model = await this.productsRepository.createEntity(data);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => Product)
  async updateProduct(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: ProductInput,
    @Ctx() ctx?: Context
  ): Promise<Product | undefined> {
    ctx && (await ctx.hasPermission(claims.updateProduct));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);
      data.name = data.name.trim();

      let model = await this.productsRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        description: Yup.string(),
        price: Yup.number().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      await this.productsRepository.updateEntity(model, data);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => Product)
  async deleteProduct(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Product | undefined> {
    ctx && (await ctx.hasPermission(claims.deleteProduct));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await this.productsRepository.getEntityById(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await this.productsRepository.deleteEntity(model);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }
}
