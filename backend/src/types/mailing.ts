import { ObjectType, Field, InputType } from "type-graphql";
import { Entity, Column } from "typeorm";
import { PagingResult } from "../utils/paginating";
import { BaseType } from "./entity";

@Entity("mailings")
@ObjectType()
export default class Mailing extends BaseType {
  @Field(() => String, { nullable: true })
  @Column()
  name: string | null = null;

  @Field(() => String)
  @Column()
  email: string | null = null;
}

@InputType()
export class MailingInput {
  @Field(() => String, { nullable: true })
  name: string | null = null;

  @Field(() => String)
  @Column()
  email: string | null;
}

@ObjectType()
export class PaginatedMailings extends PagingResult(Mailing) {}
