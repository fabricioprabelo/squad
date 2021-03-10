import { Field, InputType, ObjectType } from "type-graphql";
import { Column, Entity, ObjectID } from "typeorm";
import { SoftDeleteType } from "./Entity";
import Role from "./Role";
import Claim, { ClaimInput } from "./Claim";
import { PagingResult } from "../support/Paginating";
import { IsEmail } from "class-validator";

@Entity("users")
@ObjectType()
export default class User extends SoftDeleteType {
  @Field(() => String)
  @Column()
  name: string | null = null;

  @Field(() => String)
  @Column()
  surname: string | null = null;

  @Field(() => String)
  @Column()
  email: string | null = null;

  @Column()
  password: string | null = null;

  @Column()
  resetCode: string | null = null;

  @Column()
  resetExpires: Date | null = null;

  @Field(() => Boolean)
  @Column()
  isActivated: boolean = false;

  @Field(() => Boolean)
  @Column()
  isSuperAdmin: boolean = false;

  @Field(() => String, { nullable: true })
  @Column()
  photo: string | null = null;

  @Column()
  roleIds?: ObjectID[] = [];

  @Field(() => [Claim], { nullable: true })
  @Column()
  claims: Claim[] = [];

  @Field(() => [Role], { nullable: true })
  roles?: Role[] | null;
}

@InputType()
export class UserInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  surname: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  password: string | null = null;

  @Field(() => Boolean, { nullable: true })
  isActivated: boolean = false;

  @Field(() => Boolean, { nullable: true })
  isSuperAdmin: boolean = false;

  @Field(() => [String], { nullable: true })
  roleIds: string[];

  @Field(() => [ClaimInput], { nullable: true })
  claims: ClaimInput[];
}

@InputType()
export class RegisterInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  surname: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  passwordConfirmation: string;
}

@InputType()
export class ProfileInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  surname: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  password?: string | null;
}

@ObjectType()
export class PaginatedUsers extends PagingResult(User) {}
