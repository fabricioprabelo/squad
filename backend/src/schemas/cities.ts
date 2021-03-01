import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { mongoSortDir, policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import logger from "../utils/logger";
import City, { CityInput } from "../types/city";
import State from "../types/state";
import Country from "../types/country";
import StateAreaCode from "../types/state-area-code";
import Yup from "../configs/yup";

@Resolver()
export default class Cities {
  unknowRecordMessage: string = "Cidade não foi encontrada.";

  @Query(() => [City])
  async cities(
    @Arg("sortBy", { nullable: true }) sortBy: string = "name",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Ctx() ctx?: Context
  ): Promise<City[]> {
    ctx && (await ctx.hasPermission(policies.cities));

    try {
      let list = await City.find({
        order: { [sortBy]: sortDir },
      });

      if (list) {
        for (let model of list) {
          let state = await State.findOne(model.stateId);
          if (state) {
            const country = await Country.findOne(state.countryId);
            if (country) state.country = country;
            const stateAreaCodes = await StateAreaCode.find({
              where: { stateId: state.id.toString() },
            });
            if (stateAreaCodes) state.areaCodes = stateAreaCodes;
            model.state = state;
          }
        }
      }

      return list;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => City)
  async city(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<City | undefined> {
    ctx && (await ctx.hasPermission(policies.city));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await City.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      let state = await State.findOne(model.stateId);
      if (state) {
        const country = await Country.findOne(state.countryId);
        if (country) state.country = country;
        const stateAreaCodes = await StateAreaCode.find({
          where: { stateId: state.id.toString() },
        });
        if (stateAreaCodes) state.areaCodes = stateAreaCodes;
        model.state = state;
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => City)
  async createCity(
    @Arg("data") data: CityInput,
    @Ctx() ctx?: Context
  ): Promise<City | undefined> {
    ctx && (await ctx.hasPermission(policies.createCity));

    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        stateId: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      data.code = data.code.trim() || null;

      const has = await City.count({
        where: {
          name: { $regex: new RegExp(data.name.trim()), $options: "i" },
          stateId: data.stateId,
        },
      });
      if (has)
        throw new Error(
          "Já existe uma cidade com este nome para o estado selecionado."
        );

      let model = new City();

      model = Object.assign(model, data);
      await model.save();

      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => City)
  async updateCity(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: CityInput,
    @Ctx() ctx?: Context
  ): Promise<City | undefined> {
    ctx && (await ctx.hasPermission(policies.updateCity));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await City.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        stateId: Yup.string().required(),
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

  @Mutation(() => City)
  async deleteCity(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<City | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteCity));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await City.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      await City.delete(id);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
