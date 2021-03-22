import { Field, ID, ObjectType } from "type-graphql";
import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ObjectIdColumn,
  ObjectID,
  BaseEntity,
} from "typeorm";

@ObjectType()
export class BaseType extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  id: ObjectID;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date = new Date();

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date = new Date();
}

@ObjectType()
export class SoftDeleteType extends BaseType {
  @Field(() => Date, { nullable: true })
  @DeleteDateColumn()
  deletedAt: Date | null = null;
}
