import Logger from "../support/Logger";
import { GraphQLRequest, GraphQLRequestContext } from "apollo-server-types";
import { APP_NAME, ENVIRONMENT } from "../configs/constants";

const ApolloLoggerPlugin = {
  serverWillStart() {
    if (ENVIRONMENT !== "test")
      Logger.info(`Starting server`);
  },
  requestDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
    const regex = /IntrospectionQuery/gm;
    const query = reqContext.request.query || "{}";

    if (!(regex.exec(query) !== null) && ENVIRONMENT !== "test")
      Logger.info(`${APP_NAME} - Request did start. Query:\n ${query}`);

    return {
      parsingDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
        return (err?: Error) => {
          if (err && ENVIRONMENT !== "test") {
            Logger.error(
              `${APP_NAME} - Parsing did start: ${err.message}\n${err.stack}`
            );
          }
        };
      },
      validationDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
        return (errs?: ReadonlyArray<Error>) => {
          if (errs && ENVIRONMENT !== "test") {
            errs.forEach((err) =>
              Logger.error(
                `${APP_NAME} - Validation did start: ${err.message}\n${err.stack}`
              )
            );
          }
        };
      },
      executionDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
        return (err?: Error) => {
          if (err && ENVIRONMENT !== "test") {
            Logger.error(
              `${APP_NAME} - Excecution did start: ${err.message}\n${err.stack}`
            );
          }
        };
      },
      didEncounterErrors(error: any) {
        if (error?.errors?.length && ENVIRONMENT !== "test")
          error?.errors.forEach((err: any) => {
            Logger.error(
              `${APP_NAME} - Did encounter errors: ${err.message}\n${err.stack}`
            );
          });
      },
    };
  },
};

export default ApolloLoggerPlugin;
