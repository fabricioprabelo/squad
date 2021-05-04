import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import {
  APP_NAME,
  ENVIRONMENT,
  SERVER_HOST,
  SERVER_PORT,
  SERVER_SSL_CERT,
  SERVER_SSL_KEY,
  SERVER_SSL_PORT,
  SUBSCRIPTIONS_PATH,
} from "./configs/constants";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import Logger from "./support/Logger";
import { app, apollo, schema, connection } from "./app";

connection().then(() => {
  // SSL Options
  const sslOptions: https.ServerOptions = {
    cert: fs.readFileSync(
      path.resolve(__dirname, `../storage/private/${SERVER_SSL_CERT}`)
    ),
    key: fs.readFileSync(
      path.resolve(__dirname, `../storage/private/${SERVER_SSL_KEY}`)
    ),
  };

  const httpServer: http.Server = http.createServer(app);
  const httpsServer: https.Server = https.createServer(sslOptions, app);

  httpsServer.listen(SERVER_SSL_PORT, () => {
    Logger.info(
      `🚀 ${APP_NAME} server started under ${ENVIRONMENT} mode at https://${SERVER_HOST}:${SERVER_SSL_PORT}${apollo.graphqlPath}`
    );
    Logger.info(
      `🚀 Subscriptions server started at wss://${SERVER_HOST}:${SERVER_SSL_PORT}${SUBSCRIPTIONS_PATH}`
    );

    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server: httpsServer,
        path: SUBSCRIPTIONS_PATH,
      }
    );
  });

  // listen http server
  httpServer.listen(SERVER_PORT, () => {
    Logger.info(
      `🚀 ${APP_NAME} server started under ${ENVIRONMENT} mode at http://${SERVER_HOST}:${SERVER_PORT}${apollo.graphqlPath}`
    );
    Logger.info(
      `🚀 Subscriptions server started at ws://${SERVER_HOST}:${SERVER_PORT}${SUBSCRIPTIONS_PATH}`
    );

    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
      },
      {
        server: httpServer,
        path: SUBSCRIPTIONS_PATH,
      }
    );
  });
});
