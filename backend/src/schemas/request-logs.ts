import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { mongoSortDir, policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import logger from "../utils/logger";
import { CalculatePages } from "../utils/paginating";
import RequestLog, { PaginatedRequestLogs } from "../types/request-log";
import User from "../types/user";

@Resolver()
export default class RequestLogs {
  unknowRecordMessage: string = "Requisição não foi encontrada.";

  @Query(() => PaginatedRequestLogs)
  async requestLogs(
    @Arg("page", () => Int, { nullable: true }) page: number = 1,
    @Arg("perPage", () => Int, { nullable: true }) perPage: number = 15,
    @Arg("sortBy", { nullable: true }) sortBy: string = "createdAt",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Arg("filterByIp", { nullable: true }) filterByIp: string,
    @Arg("filterByUser", { nullable: true }) filterByUser: string,
    @Arg("filterByBody", { nullable: true }) filterByBody: string,
    @Ctx() ctx?: Context
  ): Promise<PaginatedRequestLogs> {
    ctx && (await ctx.hasPermission(policies.requestLogs, false));

    try {
      let where = {};
      if (filterByIp?.trim())
        where = {
          ...where,
          ipAddress: { $regex: new RegExp(filterByIp.trim()), $options: "i" },
        };
      if (filterByUser) {
        const user = await User.findOne(filterByUser);
        if (user) where = { ...where, userId: user.id.toString() };
      }
      if (filterByBody?.trim())
        where = {
          ...where,
          requestBody: {
            $regex: new RegExp(filterByBody.trim()),
            $options: "i",
          },
        };

      const total = await RequestLog.count({ where });
      const pagination = new CalculatePages(page, perPage, total);

      let list = await RequestLog.find({
        where,
        take: pagination.perPage,
        skip: pagination.offset,
        order: { [sortBy]: sortDir },
      });

      if (list.length) {
        for (let model of list) {
          const user = await User.findOne(model.userId);
          if (user) model.user = user;
        }
      }

      return new PaginatedRequestLogs(
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

  @Query(() => RequestLog)
  async requestLog(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<RequestLog | undefined> {
    ctx && (await ctx.hasPermission(policies.requestLog, false));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await RequestLog.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const user = await User.findOne(model.userId);
      if (user) model.user = user;

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => RequestLog)
  async deleteRequestLog(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<RequestLog | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteRequestLog));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await RequestLog.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await RequestLog.delete(id);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
