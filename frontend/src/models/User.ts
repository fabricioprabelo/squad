import { SoftDeleteModel } from ".";
import Claim from "./Claim";
import Role from "./Role";

export default interface User extends SoftDeleteModel {
  name: string;
  surname: string;
  email: string;
  password?: string | null;
  isActivated: boolean;
  isSuperAdmin: boolean;
  photo: string | null;
  claims: Claim[] | null;
  roles?: Role[] | null;
}
