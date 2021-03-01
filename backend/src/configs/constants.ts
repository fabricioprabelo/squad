import path from "path";
import dotenv from "dotenv";
import moment from "moment-timezone";

// Init dotenv
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`).trim(),
});

export const APP_NAME = process.env.APP_NAME || "App Name";
export const ENVIRONMENT = (process.env.NODE_ENV || "development")?.trim();
export const IS_PRODUCTION = ENVIRONMENT === "production";
export const IS_DEVELOPMENT = ENVIRONMENT === "development";
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 4000;
export const SERVER_SSL_PORT = Number(process.env.SERVER_SSL_PORT) || 4001;
export const SERVER_SSL_KEY = process.env.SERVER_SSL_KEY || "localhost.key";
export const SERVER_SSL_CERT = process.env.SERVER_SSL_CERT || "localhost.crt";
export const SERVER_HOST = process.env.SERVER_HOST || "localhost";
export const SERVER_SECRET = process.env.SERVER_SECRET || "abc123";

export const SINTEGRA_API_SERVER =
  process.env.SINTEGRA_API_SERVER || "localhost";

export const CACHE_REDIS_HOST = process.env.CACHE_REDIS_HOST || "localhost";
export const CACHE_REDIS_PORT = Number(process.env.CACHE_REDIS_PORT) || 6379;
export const CACHE_REDIS_PASS = process.env.CACHE_REDIS_PASS || "";

export const SORT_DESCRIPTION =
  "Valores aceitos: 1 (para classificar em ordem crescente) ou -1 (para classificar em ordem decrescente)";

export const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE) || 5;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE * 1024 * 1024;
export const mongoSortDir = (
  dir: "ASC" | "DESC" | "asc" | "desc" | 1 | -1 = "ASC"
): 1 | -1 => {
  let result: 1 | -1 = 1;
  switch (dir) {
    case "ASC":
      result = 1;
      break;
    case "DESC":
      result = -1;
      break;
    case "asc":
      result = 1;
      break;
    case "desc":
      result = -1;
      break;
    case 1:
      result = 1;
      break;
    case -1:
      result = -1;
      break;
    default:
      result = 1;
      break;
  }
  return result;
};

const mTypes =
  process.env.UPLOAD_MIME_TYPES || "image/jpeg, image/jpg, image/png";
const expMimeTypes = mTypes.split(",");
let mimeTypes: string[] = [];
for (let mime of expMimeTypes) {
  mimeTypes.push(mime.trim());
}
export const UPLOAD_MIME_TYPES = mimeTypes;

export const DATE_FORMAT = process.env.DATE_FORMAT || "YYYY-MM-DD";
export const TIME_FORMAT = process.env.TIME_FORMAT || "HH:mm:ss";
export const DATE_TIME_FORMAT =
  process.env.DATE_TIME_FORMAT || "YYYY-MM-DD HH:mm:ss";
export const TIMEZONE = process.env.TIMEZONE || "America/Sao_Paulo";

export const USER_ACTIVATION_EMAIL =
  process.env.USER_ACTIVATION_EMAIL || "contato@fabricioprabelo.com.br";

export const QUEUE_ATTEMPTS = Number(process.env.QUEUE_ATTEMPTS) || 1;
export const QUEUE_BACKOFF = Number(process.env.QUEUE_BACKOFF) || 2000;
export const QUEUE_DELAY = Number(process.env.QUEUE_DELAY) || 3000;

export const PAGING_MAX_RESULTS_PER_PAGE =
  Number(process.env.PAGING_MAX_RESULTS_PER_PAGE) || 100;
export const PAGING_RESULTS_PER_PAGE =
  Number(process.env.PAGING_RESULTS_PER_PAGE) || 15;

const log = process.env.LOG_LEVEL;
export const LOG_LEVEL:
  | "info"
  | "warn"
  | "error"
  | "trace"
  | "debug"
  | "fatal" =
  log === "info" ||
  log === "warn" ||
  log === "error" ||
  log === "trace" ||
  log === "debug" ||
  log === "fatal"
    ? log
    : "info";
export const LOG_SEQ_URL = process.env.LOG_SEQ_URL || "http://localhost:5341";
export const LOG_MAX_FILES = Number(process.env.LOG_MAX_FILES) || 7;

export const TOKEN_EXPIRES = Number(process.env.TOKEN_EXPIRES) || 7;
export const TOKEN_SECRET = process.env.TOKEN_SECRET || "abc123";

export const SMTP_HOST = process.env.SMTP_HOST || "localhost";
export const SMTP_FROM = process.env.SMTP_FROM || "";
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 25;
export const SMTP_ENABLE_SSL =
  process.env.SMTP_ENABLE_SSL?.toLowerCase() === "true" || false;

export const DATE_FORMAT_BR = process.env.DATE_FORMAT_BR || "DD/MM/YYYY";
export const DATE_TIME_FORMAT_BR =
  process.env.DATE_TIME_FORMAT_BR || "DD/MM/YYYY HH:mm:ss";

export const format_date = (
  date: Date | string,
  format?:
    | "YYYY-MM-DD HH:mm:ss"
    | "YYYY-MM-DD"
    | "HH:mm:ss"
    | "DD/MM/YYYY HH:mm:ss"
    | "DD/MM/YYYY HH:mm"
    | typeof DATE_FORMAT
    | typeof DATE_FORMAT_BR
    | typeof DATE_TIME_FORMAT
    | typeof DATE_TIME_FORMAT_BR
) => {
  const dt = moment(date);
  const formatedDate = dt.tz(TIMEZONE).format(format || DATE_TIME_FORMAT);
  return formatedDate;
};

export const now = (
  format?:
    | "YYYY-MM-DD HH:mm:ss"
    | "YYYY-MM-DD"
    | "HH:mm:ss"
    | "DD/MM/YYYY HH:mm:ss"
    | "DD/MM/YYYY HH:mm"
    | typeof DATE_FORMAT
    | typeof DATE_FORMAT_BR
    | typeof DATE_TIME_FORMAT
    | typeof DATE_TIME_FORMAT_BR
) => {
  const date = moment();
  const currentDateTime = date.tz(TIMEZONE).format(format || DATE_TIME_FORMAT);
  return currentDateTime;
};

export const date = () => {
  const date = moment();
  return date.tz(TIMEZONE);
};

export const dateTime = () => {
  const dt = moment();
  const formatedDate = dt.tz(TIMEZONE).format(DATE_TIME_FORMAT);
  return new Date(formatedDate);
};

export const convert_to_date = (date: string): Date => {
  const dt = moment(date);
  const formatedDate = dt.tz(TIMEZONE).format(DATE_TIME_FORMAT);
  return new Date(formatedDate);
};

export const capitalize = (str: any) => {
  if (typeof str === "string")
    return str.charAt(0).toUpperCase() + str.slice(1);
  return str;
};

export const httpCode = Object.freeze({
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
  ServiceUnavailable: 503,
});

export const errorCode = Object.freeze({
  Ok: "Ok",
  Error: "Error",
  NotFound: "NotFound",
  JwtExpired: "JwtExpired",
  BadRequest: "BadRequest",
  Forbidden: "Forbidden",
  TypeError: "TypeError",
  Unauthorized: "Unauthorized",
  ValidationError: "ValidationError",
  ServiceUnavailable: "ServiceUnavailable",
  InternalServerError: "InternalServerError",
});

export const policies = Object.freeze({
  clients: "Clients:Clients",
  client: "Clients:Client",
  createClient: "Clients:Create",
  updateClient: "Clients:Update",
  deleteClient: "Clients:Delete",

  products: "Products:Products",
  product: "Products:Product",
  createProduct: "Products:Create",
  updateProduct: "Products:Update",
  deleteProduct: "Products:Delete",

  stateAreaCodes: "StateAreaCodes:StateAreaCodes",
  stateAreaCode: "StateAreaCodes:StateAreaCode",
  createStateAreaCode: "StateAreaCodes:Create",
  updateStateAreaCode: "StateAreaCodes:Update",
  deleteStateAreaCode: "StateAreaCodes:Delete",

  productGroups: "ProductGroups:ProductGroups",
  productGroup: "ProductGroups:ProductGroup",
  createProductGroup: "ProductGroups:Create",
  updateProductGroup: "ProductGroups:Update",
  deleteProductGroup: "ProductGroups:Delete",

  productStocks: "ProductStocks:ProductStocks",
  productStock: "ProductStocks:ProductStock",
  createProductStock: "ProductStocks:Create",
  updateProductStock: "ProductStocks:Update",
  deleteProductStock: "ProductStocks:Delete",

  carriers: "Carriers:Carriers",
  carrier: "Carriers:Carrier",
  createCarrier: "Carriers:Create",
  updateCarrier: "Carriers:Update",
  deleteCarrier: "Carriers:Delete",

  paymentConditions: "PaymentConditions:PaymentConditions",
  paymentCondition: "PaymentConditions:PaymentCondition",
  createPaymentCondition: "PaymentConditions:Create",
  updatePaymentCondition: "PaymentConditions:Update",
  deletePaymentCondition: "PaymentConditions:Delete",

  country: "Countries:Country",
  countries: "Countries:Countries",
  countryStates: "Countries:States",
  createCountry: "Countries:Create",
  updateCountry: "Countries:Update",
  deleteCountry: "Countries:Delete",

  state: "States:State",
  states: "States:States",
  createState: "States:Create",
  updateState: "States:Update",
  deleteState: "States:Delete",

  city: "Cities:City",
  cities: "Cities:Cities",
  createCity: "City:Create",
  updateCity: "City:Update",
  deleteCity: "City:Delete",

  mailings: "Mailings:Mailings",
  mailing: "Mailings:Mailing",
  createMailing: "Mailings:Create",
  updateMailing: "Mailings:Update",
  deleteMailing: "Mailings:Delete",

  policies: "Policies:Policies",

  users: "Users:Users",
  user: "Users:User",
  createUser: "Users:Create",
  updateUser: "Users:Update",
  deleteUser: "Users:Delete",
  profileUser: "Users:Profile",

  role: "Roles:Role",
  roles: "Roles:Roles",
  createRole: "Roles:Create",
  updateRole: "Roles:Update",
  deleteRole: "Roles:Delete",

  settings: "Settings:Settings",
  setting: "Settings:Setting",
  createSetting: "Settings:Create",
  updateSetting: "Settings:Update",
  deleteSetting: "Settings:Delete",

  requestLog: "RequestLogs:RequestLog",
  requestLogs: "RequestLogs:RequestLogs",
  deleteRequestLog: "RequestLogs:Delete",
});
