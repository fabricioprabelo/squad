import { ObjectType, Field } from "type-graphql";
import User from "./User";

@ObjectType()
export default class Token {
  constructor(
    user: User,
    isSuperAdmin: boolean,
    isAdmin: boolean,
    claims: string[],
    roles: string[],
    createDate: number,
    expiresDate: number
  ) {
    this.usr = user;
    this.spa = isSuperAdmin || false;
    this.adm = isAdmin || false;
    this.clm = claims;
    this.rol = roles;
    this.uid = user?.id?.toString();
    this.iat = createDate;
    this.exp = expiresDate;
  }

  @Field(() => User)
  usr: User | null = null;

  @Field(() => Boolean)
  spa: boolean = false;

  @Field(() => Boolean)
  adm: boolean = false;

  @Field(() => [String])
  clm: string[] = [];

  @Field(() => [String])
  rol: string[] = [];

  @Field(() => String)
  uid: string | null = null;

  @Field(() => Number)
  iat: number = 0;

  @Field(() => Number)
  exp: number = 0;
}
