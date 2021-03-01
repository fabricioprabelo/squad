import { Field, InputType, ObjectType } from "type-graphql";
import { Column, Entity } from "typeorm";
import { PagingResult } from "../utils/paginating";
import Claim, { ClaimInput } from "./claim";
import { BaseType } from "./entity";
import User from "./user";

@Entity("roles")
@ObjectType()
export default class Role extends BaseType {
  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String)
  @Column()
  description: string | null;

  @Field(() => [Claim], { nullable: true })
  @Column(() => Claim)
  claims: Claim[] = [];

  @Field(() => [User], { nullable: true })
  users?: User[] | null;
}

@InputType()
export class RoleInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string | null;

  @Field(() => [ClaimInput], { nullable: true })
  claims: ClaimInput[];
}

@ObjectType()
export class PaginatedRoles extends PagingResult(Role) {}
