import User from "../types/user";
import Role from "../types/role";
import bcrypt from "bcrypt";
import { ENVIRONMENT, policies } from "../configs/constants";
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
    const password = bcrypt.hashSync("123456", salt);

    const users = [
      {
        name: "Fabricio",
        surname: "Pereira Rabelo",
        document: "35223076826",
        birthDate: new Date(1989, 4, 20), // Lembre-se que o mês é menos -1
        email: "contato@fabricioprabelo.com.br",
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
          if (user.email === "contato@fabricioprabelo.com.br") {
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
            if (user.email === "contato@fabricioprabelo.com.br") {
              const role = await Role.findOne({ name: "admin" });
              if (role) _user.roleIds.push(role.id.toString());
            }
            logger(`Atualizando usuário padrão "${_user.email}".`);
            await _user.save();
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
