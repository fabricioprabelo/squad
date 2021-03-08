import "reflect-metadata";
import "express-async-errors";
import fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import routes from "./routes";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { join } from "path";
import {
  APP_NAME,
  ENVIRONMENT,
  IS_DEVELOPMENT,
  SERVER_HOST,
  SERVER_PORT,
  SERVER_SSL_CERT,
  SERVER_SSL_KEY,
  SERVER_SSL_PORT,
} from "./configs/constants";
import resolvers from "./schemas";
import Context from "./support/Context";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import errors from "./configs/errors";
import ApolloLoggerPlugin from "./plugins/ApolloLoggerPlugin";
import Connection from "./database/Connection";
import Logger from "./support/Logger";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";

// Init dotenv
const env = process.env.NODE_ENV?.trim()?.toLowerCase() || "development";
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${env === "test" ? "development" : env}`
  ),
});

let apollo: ApolloServer;

async function server() {
  // initialize express
  const app = express();

  // set body parser
  app.use(express.json());

  // set trusted proxy
  app.set("trust proxy", true);
  app.set("trust proxy", "loopback");

  // add cords
  app.use(
    cors({
      origin: "*",
      optionsSuccessStatus: 200,
    })
  );

  // enable etag
  app.enable("etag"); // use strong etags

  // handle errors
  app.use(errors);

  // use routes file
  app.use(routes);

  // serves static files
  app.use(express.static(join(__dirname, "..", "public")));

  // initialize default database connection
  await Connection.defaultAsync();

  // schema
  const schema = await buildSchema({
    resolvers,
  });

  // Subscriptions path
  const SUBSCRIPTIONS_PATH = "/subscriptions";

  // apollo server
  apollo = new ApolloServer({
    schema,
    context: async function ({ req, res }) {
      return new Context(req, res);
    },
    subscriptions: {
      path: SUBSCRIPTIONS_PATH,
    },
    debug: IS_DEVELOPMENT,
    tracing: IS_DEVELOPMENT,
    playground: IS_DEVELOPMENT,
    introspection: IS_DEVELOPMENT,
    plugins: [ApolloLoggerPlugin],
    uploads: {
      maxFieldSize: 50 * 1024 * 1024, // 50MB
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 25,
    },
  });

  // apollo server middleware
  apollo.applyMiddleware({
    app,
    cors: { origin: "*" },
  });

  // SSL Options
  const sslOptions: https.ServerOptions = {
    cert: fs.readFileSync(
      path.resolve(__dirname, `../private/${SERVER_SSL_CERT}`)
    ),
    key: fs.readFileSync(
      path.resolve(__dirname, `../private/${SERVER_SSL_KEY}`)
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
}

server();
