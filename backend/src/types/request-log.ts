import { ObjectType, Field } from "type-graphql";
import { Entity, Column, ManyToOne } from "typeorm";
import { PagingResult } from "../utils/paginating";
import { BaseType } from "./entity";
import User from "./user";

@Entity("request_logs")
@ObjectType()
export default class RequestLog extends BaseType {
  @Field(() => String, { nullable: true })
  @Column()
  token: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  ipAddress: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  userAgent: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  referrer: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  requestBody: string | null = null;

  @Field(() => String, { nullable: true })
  @Column()
  origin: string | null = null;

  @Column()
  userId: string | null = null;

  @Field(() => User, { nullable: true })
  user?: User | null;
}

@ObjectType()
export class PaginatedRequestLogs extends PagingResult(RequestLog) {}
