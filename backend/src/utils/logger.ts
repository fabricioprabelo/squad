import fs from "fs";
import { join } from "path";
import bunyan, { LoggerOptions } from "bunyan";
import { LOG_LEVEL, now, APP_NAME } from "../configs/constants";

const logger = (
  message: string,
  severity: "info" | "error" | "warn" | "debug" = "info"
) => {
  const date = now("YYYY-MM-DD");
  const time = now("HH:mm:ss");
  const path = join(__dirname, "..", "..", "logs");

  if (!fs.existsSync(path)) fs.mkdirSync(path);

  let loggerOptions: LoggerOptions = {
    name: APP_NAME,
    version: require("../../package.json").version,
    streams: [
      {
        level: LOG_LEVEL,
        type: "file",
        path: join(__dirname, "..", "..", "logs", `${date}.log`),
      },
    ],
  };

  bunyan.createLogger(loggerOptions);

  switch (severity) {
    case "debug":
      console.log(
        "[\x1b[28m%s\x1b[0m]",
        severity.toUpperCase(),
        `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
      );
      break;
    case "error":
      console.log(
        "[\x1b[31m%s\x1b[0m]",
        severity.toUpperCase(),
        `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
      );
      break;
    case "info":
      console.log(
        "[\x1b[36m%s\x1b[0m]",
        severity.toUpperCase(),
        `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
      );
      break;
    case "warn":
      console.log(
        "[\x1b[33m%s\x1b[0m]",
        severity.toUpperCase(),
        `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
      );
      break;
    default:
      console.log(
        "[\x1b[36m%s\x1b[0m]",
        "ERRO",
        `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
      );
  }
};

export default logger;
