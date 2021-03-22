import User from "./User";

export default interface Token {
  usr: User | null;
  spa: boolean;
  adm: boolean;
  clm: string[];
  rol: string[];
  uid: string | null;
  iat: number;
  exp: number;
}
