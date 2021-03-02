import "reflect-metadata";
import "express-async-errors";
import express from "express";
import routes from "./routes";
import http from "http";
import https from "https";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
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
import logger from "./utils/logger";
import processPid from "./utils/pid";
import resolvers from "./schemas";
import Context from "./configs/context";
import ApolloLogger from "./utils/apollo-logger";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import connection from "./connection";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import errors from "./configs/errors";

// Init dotenv
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${ENVIRONMENT}`),
});

const main = async () => {
  try {
    // initialize default database connection
    await connection();

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

    // SSL Options
    const sslOptions: https.ServerOptions = {
      cert: fs.readFileSync(
        path.resolve(__dirname, `../private/${SERVER_SSL_CERT}`)
      ),
      key: fs.readFileSync(
        path.resolve(__dirname, `../private/${SERVER_SSL_KEY}`)
      ),
    };

    // schema
    const schema = await buildSchema({
      resolvers,
    });

    // apollo server
    const server = new ApolloServer({
      schema,
      context: async function ({ req, res }) {
        return new Context(req, res);
      },
      debug: IS_DEVELOPMENT,
      tracing: IS_DEVELOPMENT,
      playground: true,
      introspection: true,
      plugins: [ApolloLogger],
      uploads: {
        maxFieldSize: 50 * 1024 * 1024, // 50MB
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 25,
      },
    });

    // handle errors
    app.use(errors);

    // use routes file
    app.use(routes);

    // serves static files
    app.use(express.static(join(__dirname, "..", "public")));

    // apollo server middleware
    server.applyMiddleware({
      app,
      cors: { origin: "*" },
    });

    const httpServer: http.Server = http.createServer(app);
    const httpsServer: https.Server = https.createServer(sslOptions, app);
    const SERVER_MODE = IS_DEVELOPMENT ? "development" : "production";

    // listen https server
    httpsServer.listen(SERVER_SSL_PORT, () => {
      logger(
        "=========================================================================================="
      );
      logger(
        `| ${APP_NAME} GraphQL Server started under ${SERVER_MODE} mode at https://${SERVER_HOST}:${SERVER_SSL_PORT}${server.graphqlPath} |`
      );
    });

    // listen http server
    httpServer.listen(SERVER_PORT, () => {
      logger(
        "=========================================================================================="
      );
      logger(
        `| ${APP_NAME} GraphQL Server started under ${SERVER_MODE} mode at http://${SERVER_HOST}:${SERVER_PORT}${server.graphqlPath}  |`
      );
      logger(
        "=========================================================================================="
      );
    });

    // Create a pid file
    processPid();
  } catch (err) {
    console.log(err);
  }
};

main();
