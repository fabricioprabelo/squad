import { ObjectType, Field } from "type-graphql";
import User from "./user";

@ObjectType()
export class Login {
  constructor(user: User, token: string, expires: Date) {
    this.user = user;
    this.token = token;
    this.expires = expires;
  }

  @Field(() => User)
  user: User | null = null;

  @Field(() => String)
  token: string | null = null;

  @Field(() => Date)
  expires: Date | null = null;
}

@ObjectType()
export class ForgotPassword {
  constructor(code: string, expires: Date, url: string) {
    this.code = code;
    this.expires = expires;
    this.url = url;
  }

  @Field(() => String)
  code: string;

  @Field(() => String)
  url: string;

  @Field(() => Date)
  expires: Date;
}
