import User from "./User";

export default interface Login {
  user: User | null;
  token: string | null;
  expires: Date | null;
}
