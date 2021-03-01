import { NonEmptyArray } from "type-graphql";
import Accounts from "./accounts";
import Roles from "./roles";
import Users from "./users";
import RequestLogs from "./request-logs";
import Policies from "./policies";

const resolvers: NonEmptyArray<any> = [
  Accounts,
  Policies,
  RequestLogs,
  Roles,
  Users,
];

export default resolvers;
