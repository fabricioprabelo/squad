import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { mongoSortDir, policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import logger from "../utils/logger";
import { CalculatePages } from "../utils/paginating";
import StateAreaCode, {
  PaginatedStateAreaCodes,
  StateAreaCodeInput,
} from "../types/state-area-code";
import State from "../types/state";
import Country from "../types/country";
import City from "../types/city";
import Yup from "../configs/yup";

@Resolver()
export default class StateAreaCodes {
  unknowRecordMessage: string = "Código de área não foi encontrado.";

  @Query(() => [StateAreaCode])
  async stateAreaCodes(
    @Arg("sortBy", { nullable: true }) sortBy: string = "name",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Ctx() ctx?: Context
  ): Promise<StateAreaCode[]> {
    ctx && (await ctx.hasPermission(policies.stateAreaCodes));

    try {
      const stateAreaCodes = await StateAreaCode.find({
        order: { [sortBy]: sortDir },
      });

      if (stateAreaCodes.length) {
        for (let model of stateAreaCodes) {
          let state = await State.findOne(model.stateId);
          if (state) {
            const country = await Country.findOne(state.countryId);
            if (country) state.country = country;
            const cities = await City.find({
              where: { stateId: state.id.toString() },
              order: { name: 1 },
            });
            if (cities.length) {
              for (let city of cities) {
                city.state = state;
              }
              state.cities = cities;
            }
            model.state = state;
          }
        }
      }

      return stateAreaCodes;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => [StateAreaCode])
  async stateAreaCodesDropdown(
    @Ctx() ctx?: Context
  ): Promise<StateAreaCode[] | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      let list = await StateAreaCode.find({
        order: { code: 1 },
      });

      if (list.length) {
        for (let model of list) {
          let state = await State.findOne(model.stateId);
          if (state) {
            const country = await Country.findOne(state.countryId);
            if (country) state.country = country;
            const cities = await City.find({
              where: { stateId: state.id.toString() },
              order: { name: 1 },
            });
            if (cities.length) {
              for (let city of cities) {
                city.state = state;
              }
              state.cities = cities;
            }
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

  @Query(() => StateAreaCode)
  async stateAreaCode(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<StateAreaCode | undefined> {
    ctx && (await ctx.hasPermission(policies.stateAreaCode));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await StateAreaCode.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      let state = await State.findOne(model.stateId);
      if (state) {
        const country = await Country.findOne(state.countryId);
        if (country) state.country = country;
        const cities = await City.find({
          where: { stateId: state.id.toString() },
          order: { name: 1 },
        });
        if (cities.length) {
          for (let city of cities) {
            city.state = state;
          }
          state.cities = cities;
        }
        model.state = state;
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => StateAreaCode)
  async createStateAreaCode(
    @Arg("data") data: StateAreaCodeInput,
    @Ctx() ctx?: Context
  ): Promise<StateAreaCode | undefined> {
    ctx && (await ctx.hasPermission(policies.createStateAreaCode));

    try {
      const schema = Yup.object().shape({
        code: Yup.string().required(),
        stateId: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await StateAreaCode.count({
        code: data.code?.trim(),
      });
      if (has) throw new Error("Código de área já cadastrado em outro estado.");

      let model = new StateAreaCode();
      model = Object.assign(model, data);

      await model.save();
      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      let state = await State.findOne(model.stateId);
      if (state) {
        const country = await Country.findOne(state.countryId);
        if (country) state.country = country;
        const cities = await City.find({
          where: { stateId: state.id.toString() },
          order: { name: 1 },
        });
        if (cities.length) {
          for (let city of cities) {
            city.state = state;
          }
          state.cities = cities;
        }
        model.state = state;
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => StateAreaCode)
  async updateStateAreaCode(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: StateAreaCodeInput,
    @Ctx() ctx?: Context
  ): Promise<StateAreaCode | undefined> {
    ctx && (await ctx.hasPermission(policies.updateStateAreaCode));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await StateAreaCode.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        code: Yup.string().required(),
        stateId: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      model = Object.assign(model, data);
      await model.save();

      let state = await State.findOne(model.stateId);
      if (state) {
        const country = await Country.findOne(state.countryId);
        if (country) state.country = country;
        const cities = await City.find({
          where: { stateId: state.id.toString() },
          order: { name: 1 },
        });
        if (cities.length) {
          for (let city of cities) {
            city.state = state;
          }
          state.cities = cities;
        }
        model.state = state;
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => StateAreaCode)
  async deleteStateAreaCode(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<StateAreaCode | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteStateAreaCode));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await StateAreaCode.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      let state = await State.findOne(model.stateId);
      if (state) {
        const country = await Country.findOne(state.countryId);
        if (country) state.country = country;
        const cities = await City.find({
          where: { stateId: state.id.toString() },
          order: { name: 1 },
        });
        if (cities.length) {
          for (let city of cities) {
            city.state = state;
          }
          state.cities = cities;
        }
        model.state = state;
      }

      await StateAreaCode.delete(id);

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
