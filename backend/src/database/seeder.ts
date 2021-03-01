import User from "../types/user";
import Role from "../types/role";
import bcrypt from "bcrypt";
import { ENVIRONMENT, policies } from "../configs/constants";
import countries from "./imports/countries.json";
import states from "./imports/states.json";
import statesAreaCodes from "./imports/states_area_codes.json";
import cities from "./imports/cities.json";
import Country from "../types/country";
import State from "../types/state";
import StateAreaCode from "../types/state-area-code";
import City from "../types/city";
import connection from "../connection";
import logger from "../utils/logger";
import Claim from "../types/claim";

export default async function seeder() {
  // Create default application connection
  logger(
    `Iniciando conexão com o banco de dados para semear. Modo: ${ENVIRONMENT}`
  );
  await connection();

  try {
    logger(`Sanitizando banco de dados antes de semear.`);
    await Country.clear();
    await State.clear();
    await StateAreaCode.clear();
    await City.clear();
    await User.clear();
    await Role.clear();
  } catch (err) {
    logger(
      `Ocorreu um erro ao tentar sanitizar o banco de dados: ${err.message}\n${err.stack}`,
      "error"
    );
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync("776DY18i*", salt);

    const users = [
      {
        name: "Fabricio",
        surname: "Pereira Rabelo",
        document: "35223076826",
        birthDate: new Date(1989, 4, 20), // Lembre-se que o mês é menos -1
        email: "contato@remopp.com",
        password,
        phone: "(17) 98173-0607",
        mobile: "(17) 99169-6331",
        isActivated: true,
        isSuperAdmin: true,
      },
    ];

    const roles = [
      {
        name: "admin",
        description: "Administrador",
      },
      {
        name: "common",
        description: "Comum",
      },
    ];

    if (roles.length) {
      logger(`Semeando regras padrão.`);
      for (const role of roles) {
        const roleExists = await Role.count({ name: role.name });
        if (!roleExists) {
          let newRole = new Role();
          newRole = Object.assign(newRole, role);
          if (role.name === "admin") {
            for (const [key, value] of Object.entries(policies)) {
              const exp = value.split(":");
              const claim_type = exp[0];
              const claim_value = exp[1];
              const roleClaim = new Claim();
              roleClaim.claimType = claim_type;
              roleClaim.claimValue = claim_value;
              newRole.claims.push(roleClaim);
            }
          }
          logger(`Criando regra padrão "${newRole.name}".`);
          await newRole.save();
        } else {
          const _role = await Role.findOne({ name: role.name });
          if (_role) {
            if (role.name === "admin") {
              for (const [key, value] of Object.entries(policies)) {
                const exp = value.split(":");
                const claim_type = exp[0];
                const claim_value = exp[1];
                let roleClaim = new Claim();
                roleClaim.claimType = claim_type;
                roleClaim.claimValue = claim_value;
                _role.claims.push(roleClaim);
              }
              logger(`Atualizando regra padrão "${_role.name}".`);
              await _role.save();
            }
          }
        }
      }
    }

    if (users.length) {
      logger(`Semeando usuários padrão.`);
      for (const user of users) {
        const userExists = await User.count({
          email: user.email,
        });
        if (!userExists) {
          let newUser = new User();
          newUser = Object.assign(newUser, user);
          if (user.email === "contato@remopp.com") {
            const role = await Role.findOne({ name: "admin" });
            if (role) newUser.roleIds.push(role.id.toString());
          }
          logger(`Criando usuário padrão "${newUser.email}".`);
          await newUser.save();
        } else {
          const _user = await User.findOne({
            email: user.email,
          });
          if (_user) {
            _user.roleIds = [];
            if (user.email === "contato@remopp.com") {
              const role = await Role.findOne({ name: "admin" });
              if (role) _user.roleIds.push(role.id.toString());
            }
            logger(`Atualizando usuário padrão "${_user.email}".`);
            await _user.save();
          }
        }
      }
    }

    const hasCountries = await Country.count();
    if (!hasCountries) {
      if (countries.length) {
        logger(`Semeando países.`);
        for (const country of countries) {
          let _country = new Country();
          _country = Object.assign(_country, country);
          await _country.save();
        }
      }
    }

    const hasStates = await State.count();
    if (!hasStates) {
      if (states.length) {
        logger(`Semeando estados.`);
        const brasil = await Country.findOne({
          name: "Brasil",
        });
        if (brasil) {
          for (const state of states) {
            let _state = new State();
            _state = Object.assign(_state, state);
            _state.countryId = brasil.id.toString();
            await _state.save();
          }
        }
      }
    }

    const hasStateCodes = await StateAreaCode.count();
    if (!hasStateCodes) {
      if (statesAreaCodes.length) {
        logger(`Semeando códigos de área dos estados.`);
        for (const stateAreaCode of statesAreaCodes) {
          const state = await State.findOne({
            federativeUnit: stateAreaCode.state,
          });
          if (state) {
            delete stateAreaCode.state;
            let _stateAreaCode = new StateAreaCode();
            _stateAreaCode = Object.assign(_stateAreaCode, stateAreaCode);
            _stateAreaCode.stateId = state.id.toString();
            await _stateAreaCode.save();
          }
        }
      }
    }

    const hasCities = await City.count();
    if (!hasCities) {
      if (cities.length) {
        logger(`Semeando cidades.`);
        for (const city of cities) {
          const state = await State.findOne({
            federativeUnit: city.state,
          });
          if (state) {
            delete city.state;
            let _city = new City();
            _city = Object.assign(_city, city);
            _city.stateId = state.id.toString();
            await _city.save();
          }
        }
      }
    }

    logger("Finalizado semeadura do banco de dados.");
  } catch (err) {
    logger(
      `Ocorreu um erro ao tentar semar o banco de dados: ${err.message}\n${err.stack}`,
      "error"
    );
  }

  // Finaliza o processo
  process.exit();
}

seeder();
