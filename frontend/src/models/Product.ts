import { Model } from ".";

export default interface Product extends Model {
  name: string;
  description: string | null;
  price: number;
}
