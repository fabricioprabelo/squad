import { ErrorRequestHandler, Request, Response } from "express";
import Yup from "./yup";
import { errorCode, httpCode, SERVER_PORT } from "./constants";
import Logger from "../support/Logger";
interface ValidationErrors {
  [key: string]: string[];
}

const errors: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof Yup.ValidationError) {
    let errors: ValidationErrors = {};

    error.inner.forEach((err) => {
      errors[err.path] = err.errors;
    });

    return response.status(httpCode.UnprocessableEntity).json({
      name: errorCode.ValidationError,
      message: "Falha na validação.",
      stack: error?.stack,
      errors,
    });
  } else if (error instanceof Error) {
    return response.status(httpCode.UnprocessableEntity).json({
      name: errorCode.UnprocessableEntity,
      message: error?.message || "Ocorreu um erro.",
      stack: error?.stack,
    });
  }

  Logger.error(error);

  return response.status(httpCode.InternalServerError).json({
    name: errorCode.InternalServerError,
    message: error?.message || "Ocorreu um erro interno no servidor.",
    stack: error?.stack,
  });
};

export default errors;
