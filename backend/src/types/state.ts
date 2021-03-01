import { ObjectType, Field, ID, InputType } from "type-graphql";
import { Entity, Column, ManyToOne, OneToMany, ObjectID } from "typeorm";
import City, { CityInput } from "./city";
import Country from "./country";
import { BaseType } from "./entity";
import StateAreaCode, { StateAreaCodeInput } from "./state-area-code";

@Entity("states")
@ObjectType()
export default class State extends BaseType {
  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String)
  @Column()
  federativeUnit: string | null = null;

  @Field(() => String)
  @Column()
  code?: string | null = null;

  @Column()
  countryId: string | null = null;

  @Field(() => Country, { nullable: true })
  country?: Country | null;

  @Field(() => [City], { nullable: true })
  cities?: City[] | null;

  @Field(() => [StateAreaCode], { nullable: true })
  areaCodes?: StateAreaCode[] | null;
}

@InputType()
export class StateInput {
  @Field(() => String)
  name: string | null;

  @Field(() => String)
  federativeUnit: string | null;

  @Field(() => String)
  code: string | null;

  @Column()
  countryId: string | null;

  @Field(() => [CityInput], { nullable: true })
  cities?: CityInput[] | null;

  @Field(() => [StateAreaCodeInput], { nullable: true })
  areaCodes?: StateAreaCodeInput[] | null;
}
