import User from "../types/User";
import Role from "../types/Role";
import bcrypt from "bcrypt";
import Claim from "../types/Claim";
import claims from "../configs/claims";
import Logger from "../support/Logger";

class Seeder {
  async sanitize() {
    try {
      Logger.info(`Sanitizando banco de dados antes de semear.`);
      await User.clear();
      await Role.clear();
    } catch (err) {
      Logger.error(
        `Ocorreu um erro ao tentar sanitizar o banco de dados: ${err.message}\n${err.stack}`
      );
    }
  }

  async seed() {
    try {
      const salt = bcrypt.genSaltSync(10);
      const password = bcrypt.hashSync("123456", salt);

      const users = [
        {
          name: "Fabricio",
          surname: "Pereira Rabelo",
          email: "contato@fabricioprabelo.com.br",
          password,
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
        Logger.info(`Semeando regras padrão.`);
        for (const role of roles) {
          const roleExists = await Role.count({ name: role.name });
          if (!roleExists) {
            let newRole = new Role();
            newRole = Object.assign(newRole, role);
            if (role.name === "admin") {
              for (const [key, value] of Object.entries(claims)) {
                const exp = value.split(":");
                const claim_type = exp[0];
                const claim_value = exp[1];
                const roleClaim = new Claim();
                roleClaim.claimType = claim_type;
                roleClaim.claimValue = claim_value;
                newRole.claims.push(roleClaim);
              }
            }
            Logger.info(`Criando regra padrão "${newRole.name}".`);
            await newRole.save();
          } else {
            const _role = await Role.findOne({ name: role.name });
            if (_role) {
              if (role.name === "admin") {
                for (const [key, value] of Object.entries(claims)) {
                  const exp = value.split(":");
                  const claim_type = exp[0];
                  const claim_value = exp[1];
                  let roleClaim = new Claim();
                  roleClaim.claimType = claim_type;
                  roleClaim.claimValue = claim_value;
                  _role.claims.push(roleClaim);
                }
                Logger.info(`Atualizando regra padrão "${_role.name}".`);
                await _role.save();
              }
            }
          }
        }
      }

      if (users.length) {
        Logger.info(`Semeando usuários padrão.`);
        for (const user of users) {
          const userExists = await User.count({
            email: user.email,
          });
          if (!userExists) {
            let newUser = new User();
            newUser = Object.assign(newUser, user);
            if (user.email === "contato@fabricioprabelo.com.br") {
              const role = await Role.findOne({ name: "admin" });
              if (role) newUser.roleIds.push(role.id);
            }
            Logger.info(`Criando usuário padrão "${newUser.email}".`);
            await newUser.save();
          } else {
            const _user = await User.findOne({
              email: user.email,
            });
            if (_user) {
              _user.roleIds = [];
              if (user.email === "contato@fabricioprabelo.com.br") {
                const role = await Role.findOne({ name: "admin" });
                if (role) _user.roleIds.push(role.id);
              }
              Logger.info(`Atualizando usuário padrão "${_user.email}".`);
              await _user.save();
            }
          }
        }
      }
      Logger.info("Finalizado semeadura do banco de dados.");
    } catch (err) {
      Logger.error(
        `Ocorreu um erro ao tentar semar o banco de dados: ${err.message}\n${err.stack}`
      );
    }
  }
}

export default new Seeder();

