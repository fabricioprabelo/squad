import { ObjectType, Field, InputType } from "type-graphql";
import { Entity, Column } from "typeorm";
import { BaseType } from "./entity";

@ObjectType()
export class SettingOption {
  @Field(() => String)
  key: string | null = null;

  @Field(() => String)
  value: string | null = null;
}

@InputType()
export class SettingOptionInput {
  @Field(() => String)
  key: string | null = null;

  @Field(() => String)
  value: string | null = null;
}

@Entity("settings")
@ObjectType()
export default class Setting extends BaseType {
  @Field(() => String)
  @Column()
  code: string | null = null;

  @Field(() => String)
  @Column()
  tab: string | null = null;

  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  description: string | null = null;

  @Field(() => String)
  @Column()
  type: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  value: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  defaultValue: string | null = null;

  @Field(() => [SettingOption], { nullable: true })
  @Column()
  options: SettingOption[] = [];

  @Field(() => Number)
  @Column()
  sortOrder: number = 0;

  @Field(() => Boolean)
  @Column()
  isRequired: boolean = false;
}

@InputType()
export class SettingInput {
  @Field(() => String)
  code: string | null;

  @Field(() => String)
  tab: string | null;

  @Field(() => String)
  name: string | null;

  @Field(() => String, { nullable: true })
  description: string | null = null;

  @Field(() => String)
  type: string;

  @Field(() => String, { nullable: true })
  value: string | null = null;

  @Field(() => String, { nullable: true })
  defaultValue: string | null = null;

  @Field(() => [SettingOptionInput], { nullable: true })
  options: SettingOptionInput[] = [];

  @Field(() => Number)
  sortOrder: number = 0;

  @Field(() => Boolean)
  isRequired: boolean = false;
}
