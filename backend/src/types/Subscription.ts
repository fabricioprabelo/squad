import { ObjectType, Field, InputType } from "type-graphql";
import { Column, Entity, ObjectID } from "typeorm";
import User from "./User";
import { BaseType } from "./Entity";
@Entity("notifications")
@ObjectType()
export default class Message extends BaseType {
  @Field({ nullable: true })
  @Column()
  title: string | null = null;

  @Field({ nullable: true })
  @Column()
  image: string | null = null;

  @Field()
  @Column()
  message: string | null = null;

  @Field()
  @Column()
  isRead: boolean = false;

  @Column()
  userId: ObjectID | null = null;

  @Field(() => User, { nullable: true })
  user: User | null;
}

@InputType()
export class MessageInput {
  @Field({ nullable: true })
  title: string | null = null;

  @Field({ nullable: true })
  image: string | null = null;

  @Field()
  message: string | null = null;

  @Field({ defaultValue: false })
  isRead: boolean = false;

  @Field({ nullable: true })
  userId: string | null = null;
}

export interface MessagePayload {
  id: ObjectID;
  createdAt: Date;
  updatedAt: Date;
  title: string | null;
  image: string | null;
  message: string | null;
  isRead: boolean;
  user: User;
}
