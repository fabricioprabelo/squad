import { Field, InputType, ObjectType } from "type-graphql";
import { Column, Entity } from "typeorm";
import { PagingResult } from "../support/Paginating";
import Claim, { ClaimInput } from "./Claim";
import { BaseType } from "./Entity";
import User from "./User";

@Entity("roles")
@ObjectType()
export default class Role extends BaseType {
  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String)
  @Column()
  description: string | null = null;

  @Field(() => [Claim], { nullable: true })
  @Column(() => Claim)
  claims: Claim[] = [];
}

@InputType()
export class RoleInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => [ClaimInput], { nullable: true })
  claims: ClaimInput[] = [];
}

@ObjectType()
export class PaginatedRoles extends PagingResult(Role) {}
