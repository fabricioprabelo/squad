export const ENVIRONMENT = (process.env.NODE_ENV || "development")?.trim();
export const IS_PRODUCTION = ENVIRONMENT === "production";
export const IS_DEVELOPMENT =
  ENVIRONMENT === "test" || ENVIRONMENT === "development";
export const SITE_NAME = process.env.REACT_APP_SITE_NAME || "";
export const RECORDS_PER_PAGE =
  Number(process.env.REACT_APP_RECORDS_PER_PAGE) || 15;
