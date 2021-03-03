import app from "./app";
import server, { apollo } from "./app";
import {
  APP_NAME,
  ENVIRONMENT,
  SERVER_HOST,
  SERVER_PORT,
} from "./configs/constants";
import Logger from "./support/Logger";

// listen http server
server.then((express) =>
  express.listen(SERVER_PORT, () => {
    Logger.info(
      `🚀 ${APP_NAME} server started under ${ENVIRONMENT} mode at http://${SERVER_HOST}:${SERVER_PORT}${apollo.graphqlPath}`
    );
  })
);
