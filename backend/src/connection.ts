import { createConnection } from "typeorm";

export default async function connection() {
  return await createConnection();
}
