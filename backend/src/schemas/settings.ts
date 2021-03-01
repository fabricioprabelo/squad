import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { mongoSortDir, policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import logger from "../utils/logger";
import Setting, { SettingInput } from "../types/setting";
import State from "../types/state";
import Country from "../types/country";
import StateAreaCode from "../types/state-area-code";
import Yup from "../configs/yup";

@Resolver()
export default class Settings {
  unknowRecordMessage: string = "Configuração não foi encontrada.";

  @Query(() => [Setting])
  async settings(
    @Arg("sortBy", { nullable: true }) sortBy: string = "sortOrder",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Ctx() ctx?: Context
  ): Promise<Setting[]> {
    ctx && (await ctx.hasPermission(policies.settings));

    try {
      const settings = await Setting.find({
        order: { [sortBy]: sortDir },
      });

      return settings;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => Setting)
  async setting(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Setting | undefined> {
    ctx && (await ctx.hasPermission(policies.setting));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Setting.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Setting)
  async createSetting(
    @Arg("data") data: SettingInput,
    @Ctx() ctx?: Context
  ): Promise<Setting | undefined> {
    ctx && (await ctx.hasPermission(policies.createSetting));

    try {
      const schema = Yup.object().shape({
        code: Yup.string().required(),
        tab: Yup.string().required(),
        name: Yup.string().required(),
        type: Yup.string().required(),
        sortOrder: Yup.number().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await Setting.count({
        where: {
          code: { $regex: new RegExp(data.code.trim()), $options: "i" },
        },
      });
      if (has) throw new Error("Já existe uma configuração com este código.");

      let model = new Setting();

      model = Object.assign(model, data);
      await model.save();

      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Setting)
  async updateSetting(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: SettingInput,
    @Ctx() ctx?: Context
  ): Promise<Setting | undefined> {
    ctx && (await ctx.hasPermission(policies.updateSetting));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await Setting.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        code: Yup.string().required(),
        tab: Yup.string().required(),
        name: Yup.string().required(),
        type: Yup.string().required(),
        sortOrder: Yup.number().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      data.code = data.code.trim() || null;

      model = Object.assign(model, data);
      await model.save();

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Setting)
  async deleteSetting(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Setting | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteSetting));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Setting.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await Setting.delete(id);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
