import { ObjectType, Field, ID, InputType } from "type-graphql";
import { dateTime } from "../configs/constants";
import User from "./user";

@ObjectType()
export default class SubscriptionMessage {
  constructor(
    id: string = null,
    title: string = null,
    message: string = null,
    image: string = null,
    user: User = null,
    date: Date = dateTime()
  ) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.image = image;
    this.date = date;
    this.user = user;
  }

  @Field(() => ID, { nullable: true })
  id: string;

  @Field({ nullable: true })
  title?: string | null;

  @Field({ nullable: true })
  image?: string | null;

  @Field({ nullable: true })
  message?: string | null;

  @Field(() => Date, { nullable: true })
  date: Date | null;

  @Field(() => User, { nullable: true })
  user?: User | null;
}

@InputType()
export class SubscriptionMessageInput {
  @Field({ nullable: true })
  title?: string | null;

  @Field({ nullable: true })
  image?: string | null;

  @Field({ nullable: true })
  message?: string | null;

  @Field({ nullable: true })
  userId?: string | null;
}

export interface SubscriptionMessagePayload {
  id?: string | null;
  title?: string | null;
  image?: string | null;
  message?: string | null;
  date?: Date | null;
  user?: User | null;
}
