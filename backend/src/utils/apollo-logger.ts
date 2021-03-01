import logger from "../utils/logger";
import { GraphQLRequest, GraphQLRequestContext } from "apollo-server-types";
import { APP_NAME } from "../configs/constants";

const ApolloLogger = {
  serverWillStart() {
    logger(
      "=========================================================================================="
    );
    logger(
      `============================ Starting ${APP_NAME} GraphQL Server ==============================`
    );
  },
  requestDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
    const regex = /IntrospectionQuery|log/gm;
    const regex2 = /login/gm;
    const query = reqContext.request.query || "{}";

    if (!(regex.exec(query) !== null))
      logger(`${APP_NAME} - Request did start. Query:\n ${query}`);

    if (regex2.exec(query) !== null)
      logger(`${APP_NAME} - Request did start. Query:\n ${query}`);

    return {
      parsingDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
        return (err?: Error) => {
          if (err) {
            logger(
              `${APP_NAME} - Parsing did start: ${err.message}\n${err.stack}`,
              "error"
            );
          }
        };
      },
      validationDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
        return (errs?: ReadonlyArray<Error>) => {
          if (errs) {
            errs.forEach((err) =>
              logger(
                `${APP_NAME} - Validation did start: ${err.message}\n${err.stack}`,
                "error"
              )
            );
          }
        };
      },
      executionDidStart(reqContext: GraphQLRequestContext<GraphQLRequest>) {
        return (err?: Error) => {
          if (err) {
            logger(
              `${APP_NAME} - Excecution did start: ${err.message}\n${err.stack}`,
              "error"
            );
          }
        };
      },
      didEncounterErrors(error: any) {
        if (error?.errors?.length)
          error?.errors.forEach((err: any) => {
            logger(
              `${APP_NAME} - Did encounter errors: ${err.message}\n${err.stack}`,
              "error"
            );
          });
      },
    };
  },
};

export default ApolloLogger;
