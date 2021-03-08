import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import timezones from "../database/data/timezones.json";

// Init dotenv
const env = process.env.NODE_ENV?.trim()?.toLowerCase() || "development";
const envPath = path.join(process.cwd(), ".env");
const envDevelopmentPath = path.join(process.cwd(), ".env.development");
const envProductionPath = path.join(process.cwd(), ".env.production");

if (fs.existsSync(envPath)) {
  dotenv.config({
    path: envPath,
  });
} else if (
  (env === "test" || env === "development") &&
  fs.existsSync(envDevelopmentPath)
) {
  dotenv.config({
    path: envDevelopmentPath,
  });
} else if (env === "production" && fs.existsSync(envProductionPath)) {
  dotenv.config({
    path: envProductionPath,
  });
}

export const APP_NAME = process.env.APP_NAME?.trim() || "Application";
export const ENVIRONMENT = env;
export const IS_PRODUCTION = ENVIRONMENT === "production";
export const IS_DEVELOPMENT =
  ENVIRONMENT === "test" || ENVIRONMENT === "development";
export const SERVER_PORT =
  Number(process.env.SERVER_PORT?.trim() || 4000) || 4000;
export const SERVER_SSL_PORT =
  Number(process.env.SERVER_SSL_PORT?.trim() || 400) || 4000;
export const SERVER_HOST = process.env.SERVER_HOST?.trim() || "localhost";
export const SERVER_URL =
  process.env.SERVER_URL?.trim() || "http://localhost:4000";
export const SERVER_SSL_CERT =
  process.env.SERVER_SSL_CERT?.trim() || "localhost.crt";
export const SERVER_SSL_KEY =
  process.env.SERVER_SSL_KEY?.trim() || "localhost.key";
export const COMPANY_NAME = process.env.COMPANY_NAME?.trim() || "";
export const COMPANY_URL = process.env.COMPANY_URL?.trim() || "";
export const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS?.trim() || "";

export const SORT_DESCRIPTION =
  "Accepted values: 1 (to sort in ascending order) or -1 (to sort in descending order)";

export const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE?.trim()) || 5;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE * 1024 * 1024;

const _mimeTypes =
  process.env.UPLOAD_MIME_TYPES?.trim() || "image/jpeg, image/jpg, image/png";
let mimeTypes: string[] = _mimeTypes.split(",").map((mime) => mime.trim());
export const UPLOAD_MIME_TYPES = mimeTypes;

export const TIMEZONE = timezones.includes(process.env.TIMEZONE?.trim() || "")
  ? process.env.TIMEZONE?.trim() || ""
  : "America/Sao_Paulo";

export const USER_ACTIVATION_EMAIL =
  process.env.USER_ACTIVATION_EMAIL?.trim() || "";

export const PAGING_MAX_RESULTS_PER_PAGE =
  Number(process.env.PAGING_MAX_RESULTS_PER_PAGE?.trim()) || 100;
export const PAGING_RESULTS_PER_PAGE =
  Number(process.env.PAGING_RESULTS_PER_PAGE?.trim()) || 15;

const log = process.env.LOG_LEVEL?.trim()?.toLowerCase();
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

export const TOKEN_EXPIRES = Number(process.env.TOKEN_EXPIRES?.trim()) || 7;
export const TOKEN_SECRET = process.env.TOKEN_SECRET?.trim() || "";

export const SMTP_HOST = process.env.SMTP_HOST?.trim() || "localhost";
export const SMTP_FROM = process.env.SMTP_FROM?.trim() || "";
export const SMTP_USER = process.env.SMTP_USER?.trim() || "";
export const SMTP_PASS = process.env.SMTP_PASS?.trim() || "";
export const SMTP_PORT = Number(process.env.SMTP_PORT?.trim()) || 25;
export const SMTP_ENABLE_SSL =
  process.env.SMTP_ENABLE_SSL?.trim()?.toLowerCase() === "true" || false;

export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

export const httpCode = Object.freeze({
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  UnprocessableEntity: 422,
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
  UnprocessableEntity: "UnprocessableEntity",
  ValidationError: "ValidationError",
  ServiceUnavailable: "ServiceUnavailable",
  InternalServerError: "InternalServerError",
});
