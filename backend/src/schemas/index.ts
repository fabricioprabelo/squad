import { NonEmptyArray } from "type-graphql";
import Accounts from "./Accounts";
import Roles from "./Roles";
import Users from "./Users";
import Permissions from "./Permissions";
import Products from "./Products";

const resolvers: NonEmptyArray<any> = [
  Accounts,
  Permissions,
  Products,
  Roles,
  Users,
];

export default resolvers;
