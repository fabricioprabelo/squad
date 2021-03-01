import { NonEmptyArray } from "type-graphql";
import Accounts from "./accounts";
import Countries from "./countries";
import Roles from "./roles";
import States from "./states";
import Cities from "./cities";
import Users from "./users";
import RequestLogs from "./request-logs";
import Policies from "./policies";
import StateAreaCodes from "./state-area-codes";
import Subscriptions from "./subscriptions";
import Settings from "./settings";
import Mailings from "./mailings";

const resolvers: NonEmptyArray<any> = [
  Accounts,
  Cities,
  Countries,
  Mailings,
  Policies,
  RequestLogs,
  Roles,
  Settings,
  StateAreaCodes,
  States,
  Subscriptions,
  Users,
];

export default resolvers;
