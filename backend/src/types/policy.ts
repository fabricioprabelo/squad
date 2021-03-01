import { Field, ObjectType } from "type-graphql";
import { Column } from "typeorm";

@ObjectType()
export default class Policy {
  @Field(() => String)
  @Column()
  module: string | null = null;

  @Field(() => [String])
  @Column()
  policies: string[] = [];
}
