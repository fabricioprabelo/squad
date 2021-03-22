import { createConnection } from "typeorm";
import Logger from "../support/Logger";

class Connection {
  async defaultAsync() {
    try {
      return await createConnection();
    } catch (err) {
      Logger.error(err.message);
    }
  }
  default() {
    try {
      return createConnection();
    } catch (err) {
      Logger.error(err.message);
    }
  }
}

export default new Connection();
