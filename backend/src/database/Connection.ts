import { createConnection } from "typeorm";

class Connection {
  async defaultAsync() {
    return await createConnection();
  }
  default() {
    return createConnection();
  }
}

export default new Connection();
