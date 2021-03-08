import { NonEmptyArray } from "type-graphql";
import Accounts from "./Accounts";
import Roles from "./Roles";
import Users from "./Users";
import Permissions from "./Permissions";
import Products from "./Products";
import Subscriptions from "./Subscriptions";

const resolvers: NonEmptyArray<any> = [
  Accounts,
  Permissions,
  Products,
  Roles,
  Subscriptions,
  Users,
];

export default resolvers;
