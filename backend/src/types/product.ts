import { ObjectType, Field, Float } from "type-graphql";
import { Entity, Column } from "typeorm";
import { PagingResult } from "../utils/paginating";
import { BaseType } from "./entity";

@Entity("products")
@ObjectType()
export default class Product extends BaseType {
  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  description: string | null = null;

  @Field(() => Float, { defaultValue: 0 })
  @Column()
  price: number = 0;
}

@ObjectType()
export class PaginatedProducts extends PagingResult(Product) {}
