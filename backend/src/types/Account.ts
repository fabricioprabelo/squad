import { ObjectType, Field } from "type-graphql";
import User from "./User";

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
  constructor(
    code: string,
    expires: Date,
    url: string,
    previewUrl: string | null = null
  ) {
    this.code = code;
    this.expires = expires;
    this.url = url;
    this.previewUrl = previewUrl;
  }

  @Field(() => String)
  code: string | null = null;

  @Field(() => String)
  url: string | null = null;

  @Field(() => String, { nullable: true })
  previewUrl: string | null = null;

  @Field(() => Date)
  expires: Date | null = null;
}
