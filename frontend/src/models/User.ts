import { SoftDeleteModel } from ".";
import Claim from "./Claim";
import Role from "./Role";

export default interface User extends SoftDeleteModel {
  name: string;
  surname: string;
  email: string;
  isActivated: boolean;
  isSuperAdmin: boolean;
  photo: string | null;
  claims: Claim[] | null;
  roles?: Role[] | null;
}
