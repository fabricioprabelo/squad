import { ErrorRequestHandler, Request, Response } from "express";
import Yup from "./yup";
import logger from "../utils/logger";
import { errorCode, httpCode, SERVER_PORT, SERVER_SSL_PORT } from "./constants";
interface ValidationErrors {
  [key: string]: string[];
}

const errors: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof Yup.ValidationError) {
    let errors: ValidationErrors = {};

    error.inner.forEach((err) => {
      errors[err.path] = err.errors;
    });

    return response.status(httpCode.BadRequest).json({
      name: errorCode.ValidationError,
      message: "Falha na validação.",
      stack: error?.stack,
      errors,
    });
  }

  logger(error, "error");

  return response.status(httpCode.InternalServerError).json({
    name: errorCode.InternalServerError,
    message: "Ocorreu um erro interno no servidor.",
    stack: error?.stack,
  });
};

export default errors;

export const errorHandler = (err: any, req: Request, res: Response) => {
  logger(
    `A ${req.method} request received at ${req.protocol}://${req.hostname}${
      ":" + (req.protocol === "https" ? SERVER_SSL_PORT : SERVER_PORT)
    }${req.path}${
      req.headers.origin ? " from " + req.headers.origin : ""
    } contains an error: ${err.message}`,
    "error"
  );
  return res.status(httpCode.BadRequest).json({
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
};
