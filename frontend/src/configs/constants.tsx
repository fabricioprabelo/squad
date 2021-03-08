import timezones from "../assets/data/timezones.json";

export const ENVIRONMENT = (process.env.NODE_ENV || "development")?.trim();
export const IS_PRODUCTION = ENVIRONMENT === "production";
export const IS_DEVELOPMENT =
  ENVIRONMENT === "test" || ENVIRONMENT === "development";
export const SITE_NAME = process.env.REACT_APP_SITE_NAME || "";
export const TOKEN_SECRET = process.env.REACT_APP_TOKEN_SECRET || "";
export const RECORDS_PER_PAGE =
  Number(process.env.REACT_APP_RECORDS_PER_PAGE) || 15;
export const GRAPHQL_SERVER =
  process.env.REACT_APP_GRAPHQL_SERVER || "http://localhost:3333";
export const GRAPHQL_SERVER_PATH =
  process.env.REACT_APP_GRAPHQL_SERVER_PATH || "/graphql";
export const DATATABLE_ROWS_PER_PAGE = [15, 30, 50, 100];
export const DATE_FORMAT = process.env.REACT_APP_DATE_FORMAT || "DD/MM/YYYY";
export const DATE_TIME_FORMAT =
  process.env.REACT_APP_DATETIME_FORMAT || "DD/MM/YYYY HH:mm";
export const TIME_FORMAT = process.env.REACT_APP_TIME_FORMAT || "HH:mm";
export const TIMEZONE = timezones.includes(process.env.REACT_APP_TIMEZONE || "")
  ? process.env.REACT_APP_TIMEZONE?.trim() || "America/Sao_Paulo"
  : "America/Sao_Paulo";
export const ACCESS_DENIED = "Desculpe, você não possui privilégios suficientes para acessar esta página.";
export const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE?.trim() || 10) || 10;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE * 1024 * 1024;
