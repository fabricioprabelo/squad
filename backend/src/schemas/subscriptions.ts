import {
  Resolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Arg,
  Ctx,
  Subscription,
  Root,
} from "type-graphql";
import { dateTime } from "../configs/constants";
import Context from "../configs/context";
import SubscriptionMessage, {
  SubscriptionMessageInput,
  SubscriptionMessagePayload,
} from "../types/subscription";
import { v4 as uuid } from "uuid";
import User from "../types/user";
import { getMongoRepository, MongoRepository } from "typeorm";

@Resolver()
export default class Subscriptions {
  userRepository: MongoRepository<User> | null = null;

  constructor() {
    this.userRepository = getMongoRepository(User);
  }

  @Mutation(() => Boolean)
  async pushMassage(
    @Arg("data") data: SubscriptionMessageInput,
    @PubSub() pubSub: PubSubEngine,
    @Ctx() ctx?: Context
  ): Promise<boolean> {
    ctx && (await ctx.isAuthenticated());

    let model = new SubscriptionMessage(uuid());
    model.date = dateTime();

    if (data.userId) {
      const user = await this.userRepository.findOne(data.userId);
      if (user) model.user = user;
      delete data.userId;
    } else {
      const user = ctx && (await ctx.getUser());
      model.user = user;
    }

    const payload = Object.assign(model, data);
    await pubSub.publish("NOTIFICATIONS", payload);

    return true;
  }

  @Subscription({ topics: "NOTIFICATIONS" })
  pushMessages(
    @Root() payload: SubscriptionMessagePayload
  ): SubscriptionMessage {
    return new SubscriptionMessage(
      payload?.id,
      payload?.title,
      payload?.message,
      payload?.image,
      payload?.user,
      payload?.date
    );
  }
}
