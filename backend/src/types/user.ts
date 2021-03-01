import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Column, Entity, ObjectID } from "typeorm";
import { SoftDeleteType } from "./entity";
import Role from "./role";
import Claim, { ClaimInput } from "./claim";
import { PagingResult } from "../utils/paginating";
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

  @Field(() => String, { nullable: true })
  @Column()
  document: string | null = null;

  @Field(() => Date, { nullable: true })
  @Column()
  birthDate: Date | null = null;

  @Field(() => String)
  @Column()
  email: string | null = null;

  @Column()
  password: string | null = null;

  @Column()
  resetCode: string | null = null;

  @Column()
  resetExpires: Date | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  phone: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  mobile: string | null = null;

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
  roleIds?: string[] = [];

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

  @Field(() => String, { nullable: true })
  document: string | null = null;

  @Field(() => Date, { nullable: true })
  birthDate: Date | null = null;

  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  password: string | null = null;

  @Field(() => String, { nullable: true })
  phone: string | null = null;

  @Field(() => String, { nullable: true })
  mobile: string | null = null;

  @Field(() => Boolean, { nullable: true })
  isActivated: boolean = false;

  @Field(() => Boolean, { nullable: true })
  isSuperAdmin: boolean = false;

  @Field(() => [String], { nullable: true })
  roles?: string[];

  @Field(() => [ClaimInput], { nullable: true })
  claims?: ClaimInput[];
}

@InputType()
export class RegisterInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  surname: string;

  @Field(() => String, { nullable: true })
  document?: string;

  @Field(() => Date, { nullable: true })
  birthDate?: Date | null;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  passwordConfirmation: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  mobile?: string | null;
}

@InputType()
export class ProfileInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  surname: string;

  @Field(() => String, { nullable: true })
  document?: string;

  @Field(() => Date, { nullable: true })
  birthDate?: Date | null;

  @IsEmail()
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  password?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  mobile?: string | null;
}

@ObjectType()
export class PaginatedUsers extends PagingResult(User) {}
