import { Field, InputType, ObjectType } from "type-graphql";
import { Column } from "typeorm";

@ObjectType()
export default class Claim {
  @Field(() => String)
  @Column()
  claimType: string | null = null;

  @Field(() => String)
  @Column()
  claimValue: string | null = null;
}

@InputType()
export class ClaimInput {
  @Field(() => String)
  claimType: string;

  @Field(() => String)
  claimValue: string;
}
