import { ObjectType, Field, InputType } from "type-graphql";
import { Entity, Column, OneToMany } from "typeorm";
import { BaseType } from "./entity";
import State, { StateInput } from "./state";

@Entity("countries")
@ObjectType()
export default class Country extends BaseType {
  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String)
  @Column()
  formalName: string | null = null;

  @Field(() => String)
  @Column()
  code: string | null = null;

  @Field(() => String)
  @Column()
  phoneCode: string | null = null;

  @Field(() => String)
  @Column()
  iso?: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  iso3?: string | null = null;

  @Field(() => [State], { nullable: true })
  states: State[] | null;
}

@InputType()
export class CountryInput {
  @Field(() => String)
  name: string | null;

  @Field(() => String)
  formalName: string | null;

  @Field(() => String)
  code: string | null;

  @Field(() => String)
  phoneCode: string | null;

  @Field(() => String)
  iso: string | null;

  @Field(() => String, { nullable: true })
  iso3: string | null;

  @Field(() => [StateInput], { nullable: true })
  states: StateInput[] | null;
}
