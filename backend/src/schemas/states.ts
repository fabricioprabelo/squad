import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { mongoSortDir, policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import logger from "../utils/logger";
import State, { StateInput } from "../types/state";
import City from "../types/city";
import Country from "../types/country";
import StateAreaCode from "../types/state-area-code";
import Yup from "../configs/yup";

@Resolver()
export default class States {
  unknowRecordMessage: string = "Estado não foi encontrado.";

  @Query(() => [State])
  async states(
    @Arg("sortBy", { nullable: true }) sortBy: string = "federativeUnit",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Ctx() ctx?: Context
  ): Promise<State[]> {
    ctx && (await ctx.hasPermission(policies.states));

    try {
      const list = await State.find({
        order: { [sortBy]: sortDir },
      });
      for (let model of list) {
        const country = await Country.findOne(model.countryId);
        model.country = country || null;
        const stateAreaCodes = await StateAreaCode.find({
          where: { stateId: model.id.toString() },
          order: { code: 1 },
        });
        model.areaCodes =
          stateAreaCodes?.map((stateAreaCode) => {
            stateAreaCode.state = model;
            return stateAreaCode;
          }) || [];
        const cities = await City.find({
          where: { stateId: model.id.toString() },
          order: { name: 1 },
        });
        model.cities =
          cities?.map((city) => {
            city.state = model;
            return city;
          }) || [];
      }

      return list;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => [City])
  async stateCities(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<City[] | undefined> {
    ctx && (await ctx.hasPermission(policies.cities));

    try {
      const model = await State.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const country = await Country.findOne(model.countryId);
      model.country = country || null;
      const stateAreaCodes = await StateAreaCode.find({
        where: { stateId: model.id.toString() },
        order: { code: 1 },
      });
      model.areaCodes =
        stateAreaCodes?.map((stateAreaCode) => {
          stateAreaCode.state = model;
          return stateAreaCode;
        }) || [];
      const cities = await City.find({
        where: { stateId: model.id.toString() },
        order: { name: 1 },
      });

      return (
        cities?.map((city) => {
          city.state = model;
          return city;
        }) || []
      );
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => State)
  async state(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<State | undefined> {
    ctx && (await ctx.hasPermission(policies.state));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await State.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const country = await Country.findOne(model.countryId);
      model.country = country || null;
      const stateAreaCodes = await StateAreaCode.find({
        where: { stateId: model.id.toString() },
        order: { code: 1 },
      });
      model.areaCodes =
        stateAreaCodes?.map((stateAreaCode) => {
          stateAreaCode.state = model;
          return stateAreaCode;
        }) || [];
      const cities = await City.find({
        where: { stateId: model.id.toString() },
        order: { name: 1 },
      });
      model.cities =
        cities?.map((city) => {
          city.state = model;
          return city;
        }) || [];

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => State)
  async createState(
    @Arg("data") data: StateInput,
    @Ctx() ctx?: Context
  ): Promise<State | undefined> {
    ctx && (await ctx.hasPermission(policies.createState));

    try {
      const has = await State.count({
        where: {
          name: { $regex: new RegExp(data.name.trim()), $options: "i" },
          countryId: data.countryId,
        },
      });
      if (has)
        throw new Error(
          "Já existe um estado com este nome para o país selecionado."
        );

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        federativeUnit: Yup.string().required(),
        code: Yup.string().required(),
        countryId: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      let cities = [];
      let areaCodes = [];
      if (data?.cities?.length) cities = data.cities;
      if (data?.areaCodes?.length) areaCodes = data.areaCodes;

      delete data?.cities;
      delete data?.areaCodes;

      let model = new State();

      model = Object.assign(model, data);
      await model.save();

      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      if (cities.length) {
        for (const city of cities) {
          let _city = new City();
          _city = Object.assign(_city, city);
          _city.stateId = model.id.toString();
          await _city.save();
        }
      }

      if (areaCodes.length) {
        for (const areaCode of areaCodes) {
          let _areaCode = new StateAreaCode();
          _areaCode = Object.assign(_areaCode, areaCode);
          _areaCode.stateId = model.id.toString();
          await _areaCode.save();
        }
      }

      const country = await Country.findOne(model.countryId);
      model.country = country || null;
      const stateAreaCodes = await StateAreaCode.find({
        where: { stateId: model.id.toString() },
        order: { code: 1 },
      });
      model.areaCodes =
        stateAreaCodes?.map((stateAreaCode) => {
          stateAreaCode.state = model;
          return stateAreaCode;
        }) || [];
      const _cities = await City.find({
        where: { stateId: model.id.toString() },
        order: { name: 1 },
      });
      model.cities =
        _cities?.map((city) => {
          city.state = model;
          return city;
        }) || [];

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => State)
  async updateState(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: StateInput,
    @Ctx() ctx?: Context
  ): Promise<State | undefined> {
    ctx && (await ctx.hasPermission(policies.updateState));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await State.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        federativeUnit: Yup.string().required(),
        code: Yup.string().required(),
        countryId: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      if (data?.cities?.length) {
        for (const city of data.cities) {
          let _city = new City();
          _city = Object.assign(_city, city);
          _city.stateId = model.id.toString();
          await _city.save();
        }
        delete data.cities;
      }

      if (data?.areaCodes?.length) {
        for (const areaCode of data.areaCodes) {
          let _areaCode = new StateAreaCode();
          _areaCode = Object.assign(_areaCode, areaCode);
          _areaCode.stateId = model.id.toString();
          await _areaCode.save();
        }
        delete data.areaCodes;
      }

      model = Object.assign(model, data);
      await model.save();

      const country = await Country.findOne(model.countryId);
      model.country = country || null;
      const stateAreaCodes = await StateAreaCode.find({
        where: { stateId: model.id.toString() },
        order: { code: 1 },
      });
      model.areaCodes =
        stateAreaCodes?.map((stateAreaCode) => {
          stateAreaCode.state = model;
          return stateAreaCode;
        }) || [];
      const _cities = await City.find({
        where: { stateId: model.id.toString() },
        order: { name: 1 },
      });
      model.cities =
        _cities?.map((city) => {
          city.state = model;
          return city;
        }) || [];

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => State)
  async deleteState(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<State | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteState));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await State.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const country = await Country.findOne(model.countryId);
      model.country = country || null;
      const _stateAreaCodes = await StateAreaCode.find({
        where: { stateId: model.id.toString() },
        order: { code: 1 },
      });
      model.areaCodes =
        _stateAreaCodes?.map((stateAreaCode) => {
          stateAreaCode.state = model;
          return stateAreaCode;
        }) || [];
      const _cities = await City.find({
        where: { stateId: model.id.toString() },
        order: { name: 1 },
      });
      model.cities =
        _cities?.map((city) => {
          city.state = model;
          return city;
        }) || [];

      await State.delete(id);

      const stateAreaCodes = await StateAreaCode.find({
        where: { stateId: id },
      });
      stateAreaCodes?.forEach(
        async (stateAreaCode) => await stateAreaCode.remove()
      );

      const cities = await City.find({
        where: { stateId: id },
      });
      cities?.forEach(async (city) => await city.remove());

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
