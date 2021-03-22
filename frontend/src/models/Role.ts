import { Model } from ".";
import Claim from "./Claim";

export default interface Role extends Model {
  name: string;
  description: string;
  claims: Claim[];
}
