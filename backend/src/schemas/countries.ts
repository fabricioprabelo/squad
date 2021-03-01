import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { mongoSortDir, policies, SORT_DESCRIPTION } from "../configs/constants";
import Context from "../configs/context";
import logger from "../utils/logger";
import Country, { CountryInput } from "../types/country";
import State, { StateInput } from "../types/state";
import City, { CityInput } from "../types/city";
import StateAreaCode, { StateAreaCodeInput } from "../types/state-area-code";
import Yup from "../configs/yup";

@Resolver()
export default class Countries {
  unknowRecordMessage: string = "País não foi encontrado.";

  @Query(() => [Country])
  async countries(
    @Arg("sortBy", { nullable: true }) sortBy: string = "name",
    @Arg("sortDir", () => Int, {
      nullable: true,
      description: SORT_DESCRIPTION,
    })
    sortDir: number = 1,
    @Ctx() ctx?: Context
  ): Promise<Country[]> {
    ctx && (await ctx.hasPermission(policies.countries));

    try {
      let list = await Country.find({
        order: { [sortBy]: sortDir },
      });

      if (list) {
        for (let model of list) {
          const states = await State.find({
            where: { countryId: model.id.toString() },
          });
          if (states) {
            for (let state of states) {
              state.country = model;
              const cities = await City.find({
                where: { stateId: state.id.toString() },
              });
              if (cities) {
                for (let city of cities) {
                  city.state = state;
                }
                state.cities = cities;
              }
            }
            model.states = states;
          }
        }
      }

      return list;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => [State])
  async countryStates(
    @Arg("iso") iso: string = "BR",
    @Ctx() ctx?: Context
  ): Promise<State[] | undefined> {
    ctx && (await ctx.hasPermission(policies.countryStates));

    try {
      iso = iso.trim().toUpperCase();
      if (!iso) throw new Error(this.unknowRecordMessage);

      const country = await Country.findOne({ iso });
      if (!country) throw new Error(this.unknowRecordMessage);

      let states = await State.find({
        where: { countryId: country.id.toString() },
        order: { federativeUnit: 1 },
      });

      if (states) {
        for (let state of states) {
          state.country = country;
          const cities = await City.find({
            where: { stateId: state.id.toString() },
          });
          if (cities) {
            for (let city of cities) {
              city.state = state;
            }
            state.cities = cities;
          }
        }
      }

      return states;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => Country)
  async country(
    @Arg("id") id: string,
    @Ctx() ctx?: Context
  ): Promise<Country | undefined> {
    ctx && (await ctx.hasPermission(policies.country));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Country.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const states = await State.find({
        where: { countryId: model.id.toString() },
      });
      if (states) {
        for (let state of states) {
          state.country = model;
          const cities = await City.find({
            where: { stateId: state.id.toString() },
          });
          if (cities) {
            for (let city of cities) {
              city.state = state;
            }
            state.cities = cities;
          }
        }
        model.states = states;
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Country)
  async createCountry(
    @Arg("data") data: CountryInput,
    @Ctx() ctx?: Context
  ): Promise<Country | undefined> {
    ctx && (await ctx.hasPermission(policies.createCountry));

    try {
      data.name = data.name.trim();
      data.iso = data.iso.trim().toUpperCase();
      data.iso3 = data.iso3.trim().toUpperCase();

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        formalName: Yup.string().required(),
        code: Yup.string().required(),
        phoneCode: Yup.string().required(),
        iso: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const has = await Country.count({
        where: {
          $or: [
            { name: { $regex: new RegExp(data.name), $options: "i" } },
            { iso: data.iso },
            { iso3: data.iso3 },
          ],
        },
      });
      if (has) throw new Error("Já existe um país com este nome ou ISO.");

      let model = new Country();

      let states: StateInput[] = [];
      if (data?.states?.length) {
        states = data.states;
        delete data.states;
      }

      model = Object.assign(model, data);
      await model.save();

      if (!model.id) throw new Error("Ocorreu um erro ao salvar registro.");

      if (states?.length) {
        for (const state of states) {
          let _state = await State.findOne({
            where: {
              name: { $regex: new RegExp(state.name), $options: "i" },
              countryId: model.id.toString(),
            },
          });
          if (!_state) _state = new State();

          _state = Object.assign(_state, state);
          _state.countryId = model.id.toString();

          let cities: CityInput[] = [];
          if (state?.cities?.length) {
            cities = state.cities;
            delete state.cities;
          }
          let stateAreaCodes: StateAreaCodeInput[] = [];
          if (state?.areaCodes?.length) {
            stateAreaCodes = state.areaCodes;
            delete state.areaCodes;
          }

          await _state.save();

          if (_state) {
            _state.country = model;
            _state.cities = [];
            _state.areaCodes = [];
            if (cities.length) {
              for (const city of cities) {
                let _city = await City.findOne({
                  where: {
                    name: { $regex: new RegExp(city.name), $options: "i" },
                    stateId: _state.id.toString(),
                  },
                });
                if (!_city) _city = new City();

                _city = Object.assign(_city, city);
                _city.stateId = _state.id.toString();
                await _city.save();

                _city.state = _state;
                _state.cities.push(_city);
              }
            }
            if (stateAreaCodes.length) {
              for (const areaCode of stateAreaCodes) {
                let _areaCode = await StateAreaCode.findOne({
                  where: {
                    code: areaCode.code,
                    stateId: _state.id.toString(),
                  },
                });
                if (!_areaCode) _areaCode = new StateAreaCode();

                _areaCode = Object.assign(_areaCode, areaCode);
                _areaCode.stateId = _state.id.toString();
                await _areaCode.save();

                _areaCode.state = _state;
                _state.areaCodes.push(_areaCode);
              }
            }
          }
        }
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Country)
  async updateCountry(
    @Arg("id", { nullable: false }) id: string,
    @Arg("data") data: CountryInput,
    @Ctx() ctx?: Context
  ): Promise<Country | undefined> {
    ctx && (await ctx.hasPermission(policies.updateCountry));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      let model = await Country.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        formalName: Yup.string().required(),
        code: Yup.string().required(),
        phoneCode: Yup.string().required(),
        iso: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      let states: StateInput[] = [];
      if (data?.states?.length) {
        states = data.states;
        delete data.states;
      }

      model = Object.assign(model, data);
      await model.save();

      if (states?.length) {
        for (const state of states) {
          let _state = await State.findOne({
            where: {
              name: { $regex: new RegExp(state.name), $options: "i" },
              countryId: model.id.toString(),
            },
          });
          if (!_state) _state = new State();

          _state = Object.assign(_state, state);
          _state.countryId = model.id.toString();

          let cities: CityInput[] = [];
          if (state?.cities?.length) {
            cities = state.cities;
            delete state.cities;
          }
          let stateAreaCodes: StateAreaCodeInput[] = [];
          if (state?.areaCodes?.length) {
            stateAreaCodes = state.areaCodes;
            delete state.areaCodes;
          }

          await _state.save();

          if (_state) {
            _state.country = model;
            if (cities.length) {
              for (const city of cities) {
                let _city = await City.findOne({
                  where: {
                    name: { $regex: new RegExp(city.name), $options: "i" },
                    stateId: _state.id.toString(),
                  },
                });
                if (!_city) _city = new City();

                _city = Object.assign(_city, city);
                _city.stateId = _state.id.toString();
                await _city.save();

                _city.state = _state;
              }
            }
            if (stateAreaCodes.length) {
              for (const areaCode of stateAreaCodes) {
                let _areaCode = await StateAreaCode.findOne({
                  where: {
                    code: areaCode.code,
                    stateId: _state.id.toString(),
                  },
                });
                if (!_areaCode) _areaCode = new StateAreaCode();

                _areaCode = Object.assign(_areaCode, areaCode);
                _areaCode.stateId = _state.id.toString();
                await _areaCode.save();

                _areaCode.state = _state;
              }
            }
            const __cities = await City.find({
              where: { stateId: _state.id.toString() },
            });
            const __stateAreaCodes = await StateAreaCode.find({
              where: { stateId: _state.id.toString() },
            });
            if (__cities?.length) {
              for (let __city of __cities) {
                __city.state = _state;
              }
            }
            if (__stateAreaCodes?.length) {
              for (let __stateAreaCode of __stateAreaCodes) {
                __stateAreaCode.state = _state;
              }
            }
            _state.cities = __cities || [];
            _state.areaCodes = __stateAreaCodes || [];
          }
        }
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => Country)
  async deleteCountry(
    @Arg("id", { nullable: false }) id: string,
    @Ctx() ctx?: Context
  ): Promise<Country | undefined> {
    ctx && (await ctx.hasPermission(policies.deleteCountry));

    try {
      if (!id) throw new Error(this.unknowRecordMessage);

      const model = await Country.findOne(id);
      if (!model) throw new Error(this.unknowRecordMessage);

      const states = await State.find({
        where: { countryId: id },
      });
      if (states) {
        model.states = [];
        for (let state of states) {
          const cities = await City.find({
            where: { stateId: state.id.toString() },
          });
          const stateAreaCodes = await StateAreaCode.find({
            where: { stateId: state.id.toString() },
          });
          if (cities?.length) {
            for (let city of cities) {
              city.state = state;
            }
          }
          if (stateAreaCodes?.length) {
            for (let stateAreaCode of stateAreaCodes) {
              stateAreaCode.state = state;
            }
          }
          state.cities = cities || [];
          state.areaCodes = stateAreaCodes || [];
        }
        model.states = states;
      }

      await Country.delete(id);
      if (states) {
        for (const state of states) {
          await State.delete(state.id.toString());
          const cities = await City.find({
            where: { stateId: state.id.toString() },
          });
          cities?.forEach(async (city) => await city.remove());
          const stateAreaCodes = await StateAreaCode.find({
            where: { stateId: state.id.toString() },
          });
          stateAreaCodes?.forEach(
            async (stateAreaCode) => await stateAreaCode.remove()
          );
        }
      }

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
