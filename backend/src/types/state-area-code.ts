import { ObjectType, Field, InputType } from "type-graphql";
import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { PagingResult } from "../utils/paginating";
import { BaseType } from "./entity";
import State from "./state";

@Entity("states_area_codes")
@ObjectType()
export default class StateAreaCode extends BaseType {
  @Field(() => String)
  @Column()
  code: string | null = null;

  @Column()
  stateId: string | null = null;

  @Field(() => State, { nullable: true })
  state?: State | null;
}

@InputType()
export class StateAreaCodeInput {
  @Field(() => String)
  code: string;

  @Field(() => String)
  stateId: string;
}

@ObjectType()
export class PaginatedStateAreaCodes extends PagingResult(StateAreaCode) {}
