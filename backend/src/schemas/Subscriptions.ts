import {
  Resolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Arg,
  Ctx,
  Subscription,
  Root,
  Query,
} from "type-graphql";
import Message, { MessageInput, MessagePayload } from "../types/Subscription";
import User from "../types/User";
import Context from "../support/Context";

@Resolver()
export default class Subscriptions {
  @Query(() => [Message])
  async unreadSubscriptionMessages(
    @Ctx() ctx?: Context
  ): Promise<Message[] | undefined> {
    ctx && (await ctx.isAuthenticated());

    const user = await ctx.getUser();
    let messages = await Message.find({ isRead: false, userId: user.id });
    messages = messages.map((message) => {
      message.user = user;
      return message;
    });

    return messages;
  }

  @Mutation(() => Boolean)
  async pushSubscriptionMessage(
    @Arg("data") data: MessageInput,
    @PubSub() pubSub: PubSubEngine,
    @Ctx() ctx?: Context
  ): Promise<boolean> {
    ctx && (await ctx.isAuthenticated());

    let model = new Message();

    let user: User | null = null;
    if (data.userId) {
      const _user = await User.findOne(data.userId);
      if (_user) {
        user = _user;
        model.userId = _user.id;
      }
    } else {
      user = await ctx.getUser();
      model.userId = user.id;
    }
    delete data.userId;

    const payload = Object.assign(model, data);
    await payload.save();

    payload.user = user;

    await pubSub.publish("NOTIFICATIONS", payload);

    return true;
  }

  @Mutation(() => Boolean)
  async markAsReadSubscriptionMessage(
    @Arg("id") id: string,
    @Ctx() ctx?: Context
  ): Promise<boolean> {
    ctx && (await ctx.isAuthenticated());

    let model = await Message.findOne(id);
    if (!model) throw new Error("Mensagem não encontrada.");

    model.isRead = true;
    await model.save();

    return true;
  }

  @Mutation(() => Boolean)
  async markAsReadSubscriptionMessages(
    @Arg("ids", () => [String]) ids: string[],
    @Ctx() ctx?: Context
  ): Promise<boolean> {
    ctx && (await ctx.isAuthenticated());

    await ids.forEach(async (id) => {
      let model = await Message.findOne(id);
      if (!model) throw new Error("Mensagem não encontrada.");

      model.isRead = true;
      await model.save();
    });

    return true;
  }

  @Subscription({ topics: "NOTIFICATIONS" })
  subscriptionMessage(@Root() payload: MessagePayload): Message | null {
    let model = new Message();
    model = Object.assign(model, payload);

    return model;
  }
}
