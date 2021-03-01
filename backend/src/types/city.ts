import { ObjectType, Field, InputType } from "type-graphql";
import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseType } from "./entity";
import State from "./state";

@Entity("cities")
@ObjectType()
export default class City extends BaseType {
  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String)
  @Column()
  nameAbbr: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  postcode: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  code: string | null = null;

  @Column()
  stateId: string | null = null;

  @Field(() => State, { nullable: true })
  state: State | null;
}

@InputType()
export class CityInput {
  @Field(() => String)
  name: string | null;

  @Field(() => String)
  @Column()
  nameAbbr: string | null = null;

  @Field(() => String, { nullable: true })
  postcode: string | null = null;

  @Field(() => String, { nullable: true })
  code: string | null;

  @Field(() => String)
  stateId: string | null;
}
