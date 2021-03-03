import { ObjectType, Field, Float, InputType } from "type-graphql";
import { Entity, Column } from "typeorm";
import { PagingResult } from "../support/Paginating";
import { BaseType } from "./Entity";

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

@InputType()
export class ProductInput {
  @Field(() => String)
  name: string | null = null;

  @Field(() => String, { nullable: true })
  description: string | null = null;

  @Field(() => Float, { defaultValue: 0 })
  price: number = 0;
}

@ObjectType()
export class PaginatedProducts extends PagingResult(Product) {}
