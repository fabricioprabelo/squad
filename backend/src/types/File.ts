import { Stream } from "stream";
import { Field, InputType } from "type-graphql";

@InputType()
export default class FileInput {
  @Field()
  filename: string | null = null;

  @Field()
  mimetype: string | null = null;

  @Field()
  encoding: string | null = null;

  @Field((type) => Stream)
  createReadStream: () => Stream;
}
