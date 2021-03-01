import { ObjectType, Field } from "type-graphql";
import User from "./user";

@ObjectType()
export default class Token {
  constructor(
    user: User,
    isAdmin: boolean,
    claims: string[],
    roles: string[],
    createDate: number,
    expiresDate: number
  ) {
    this.user = user;
    this.isSuperAdmin = user?.isSuperAdmin || false;
    this.isAdmin = isAdmin || false;
    this.claims = claims;
    this.roles = roles;
    this.uid = user?.id?.toString();
    this.iat = createDate;
    this.exp = expiresDate;
  }

  @Field(() => User)
  user: User | null = null;

  @Field(() => Boolean)
  isSuperAdmin: boolean = false;

  @Field(() => Boolean)
  isAdmin: boolean = false;

  @Field(() => [String])
  claims: string[] = [];

  @Field(() => [String])
  roles: string[] = [];

  @Field(() => String)
  uid: string | null = null;

  @Field(() => Number)
  iat: number = 0;

  @Field(() => Number)
  exp: number = 0;
}
