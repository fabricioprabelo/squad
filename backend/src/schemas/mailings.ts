import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import Mailing, { PaginatedMailings, MailingInput } from "../types/mailing";
import logger from "../utils/logger";
import { CalculatePages } from "../utils/paginating";
import Yup from "../configs/yup";

@Resolver()
export default class Mailings {
  unknowRecordMessage: string = "E-mail não foi encontrado.";

  @Query(() => PaginatedMailings)
  async mailings(
    @Arg("page", () => Int, { nullable: true }) page: number = 1,
    @Arg("perPage", () => Int, { nullable: true }) perPage: number = 15,
    @Arg("sortBy", { nullable: true }) sortBy: string = "email",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Ctx() ctx?: Context
  ): Promise<PaginatedMailings> {
    ctx && (await ctx.hasPermission(policies.mailings));

    try {
      const total = await Mailing.count();
      const pagination = new CalculatePages(page, perPage, total);

      let list = await Mailing.find({
        take: pagination.perPage,
        skip: pagination.offset,
        order: { [sortBy]: sortDir },
      });

      return new PaginatedMailings(
        pagination.total,
        pagination.pages,
        pagination.perPage,
        pagination.currentPage,
        list
      );
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => Mailing)
  async mailing(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Mailing | undefined> {
    ctx && (await ctx.hasPermission(policies.mailing));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Mailing.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Mailing)
  async createMailing(
    @Arg("data") data: MailingInput,
    @Ctx() ctx?: Context
  ): Promise<Mailing | undefined> {
    ctx && (await ctx.hasPermission(policies.createMailing));

    try {
      const schema = Yup.object().shape({
        email: Yup.string().email().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await Mailing.count({
        email: data.email?.trim()?.toLowerCase(),
      });
      if (has) throw new Error("E-mail já registrado. Obrigado!");

      let model = new Mailing();

      model = Object.assign(model, data);
      await model.save();

      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Mailing)
  async updateMailing(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: MailingInput,
    @Ctx() ctx?: Context
  ): Promise<Mailing | undefined> {
    ctx && (await ctx.hasPermission(policies.updateMailing));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await Mailing.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        email: Yup.string().email().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      model = Object.assign(model, data);
      await model.save();

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Mailing)
  async deleteMailing(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Mailing | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteMailing));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Mailing.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await Mailing.delete(id);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
