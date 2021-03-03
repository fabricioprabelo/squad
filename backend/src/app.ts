import "reflect-metadata";
import "express-async-errors";
import express from "express";
import routes from "./routes";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { join } from "path";
import { IS_DEVELOPMENT } from "./configs/constants";
import resolvers from "./schemas";
import Context from "./support/Context";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import errors from "./configs/errors";
import ApolloLoggerPlugin from "./plugins/ApolloLoggerPlugin";
import Connection from "./database/Connection";

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

  // apollo server
  apollo = new ApolloServer({
    schema,
    context: async function ({ req, res }) {
      return new Context(req, res);
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

  return app;
}

const app = server();

export { apollo };
export default app;
