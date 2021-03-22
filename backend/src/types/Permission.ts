import { Field, ObjectType } from "type-graphql";
import { Column } from "typeorm";

@ObjectType()
export default class Permission {
  @Field(() => String)
  @Column()
  module: string | null = null;

  @Field(() => [String])
  @Column()
  claims: string[] = [];
}
