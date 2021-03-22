import { Model } from ".";
import User from "./User";

export default interface Message extends Model {
  title: string | null;
  image: string | null;
  message: string | null;
  isRead: boolean;
  user: User | null;
}
