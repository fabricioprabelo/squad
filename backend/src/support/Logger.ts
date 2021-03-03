import fs from "fs";
import { join } from "path";
import Bunyan, { LoggerOptions } from "bunyan";
import { LOG_LEVEL, APP_NAME } from "../configs/constants";
import DateTime from "./DateTime";

class Logger {
  private date: string;
  private path: string;

  constructor() {
    this.date = DateTime.now().format("YYYY-MM-DD");
    this.path = join(__dirname, "..", "logs");

    if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);

    const options: LoggerOptions = {
      name: APP_NAME,
      version: require("../../package.json").version,
      streams: [
        {
          level: LOG_LEVEL,
          type: "file",
          path: join(__dirname, "..", "logs", `${this.date}.log`),
        },
      ],
    };

    Bunyan.createLogger(options);
  }

  info(message: string | object): void {
    const time = DateTime.now().format("HH:mm:ss");

    console.log(
      "[\x1b[36m%s\x1b[0m]",
      "INFO",
      `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
    );
  }

  error(message: string | object): void {
    const time = DateTime.now().format("HH:mm:ss");

    console.log(
      "[\x1b[31m%s\x1b[0m]",
      "ERROR",
      `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
    );
  }

  warn(message: string | object): void {
    const time = DateTime.now().format("HH:mm:ss");

    console.log(
      "[\x1b[33m%s\x1b[0m]",
      "WARN",
      `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
    );
  }

  debug(message: string | object): void {
    const time = DateTime.now().format("HH:mm:ss");

    console.log(
      "[\x1b[28m%s\x1b[0m]",
      "DEBUG",
      `\x1b[1m\x1b[30m${time}\x1b[0m ${message}`
    );
  }
}

export default new Logger();
