import "reflect-metadata";
import "express-async-errors";
import express from "express";
import routes from "./routes";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { join } from "path";
import {
  IS_DEVELOPMENT,
  SUBSCRIPTIONS_PATH,
} from "./configs/constants";
import resolvers from "./schemas";
import Context from "./support/Context";
import { buildSchema, buildSchemaSync } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import errors from "./configs/errors";
import ApolloLoggerPlugin from "./plugins/ApolloLoggerPlugin";
import Connection from "./database/Connection";
import Logger from "./support/Logger";
import { GraphQLSchema } from "graphql";

// Init dotenv
const env = process.env.NODE_ENV?.trim()?.toLowerCase() || "development";
dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${env === "test" ? "development" : env}`
  ),
});

const connection = async () => {
  try {
    // initialize default database connection
    await Connection.defaultAsync();
  } catch (err) {
    Logger.error(err.message);
  }
}

// schema
const schema: GraphQLSchema =  buildSchemaSync({
  resolvers,
});


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

// apollo server
const apollo: ApolloServer = new ApolloServer({
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

export {app, apollo, schema, connection};
