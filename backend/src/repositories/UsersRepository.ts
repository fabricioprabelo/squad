import {
  DATE_TIME_FORMAT,
  TOKEN_EXPIRES,
  TOKEN_SECRET,
  USER_ACTIVATION_EMAIL,
} from "../configs/constants";
import Role from "../types/Role";
import User, {
  PaginatedUsers,
  ProfileInput,
  RegisterInput,
  UserInput,
} from "../types/User";
import bcrypt from "bcrypt";
import encrypt from "js-sha256";
import DateTime from "../support/DateTime";
import SendMailService from "../services/SendMailService";
import {
  EntityRepository,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  ObjectID,
  Repository,
} from "typeorm";
import fs from "fs";
import path from "path";
import { ForgotPassword, Login } from "../types/Account";
import claims from "../configs/claims";
import Token from "../types/Token";
import jwt from "jsonwebtoken";
import FileInput from "../types/File";
import sharp from "sharp";
import md5 from "md5";
import { createWriteStream } from "fs";
import { IEntityPagination, ISoftDeleteRepository } from ".";
import { CalculatePages } from "../support/Paginating";

@EntityRepository(User)
class UsersRepository
  extends Repository<User>
  implements
    ISoftDeleteRepository<User, UserInput>,
    IEntityPagination<User, PaginatedUsers> {
  private tokenUser(model: User): User {
    let user = new User();
    user = Object.assign(user, model);

    delete user.password;
    delete user.resetCode;
    delete user.resetExpires;
    delete user.roleIds;
    delete user.claims;
    delete user.roles;
    delete user.isSuperAdmin;
    delete user.isActivated;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.deletedAt;

    return user;
  }

  async getEntitiesPagination(
    page: number,
    perPage: number,
    sortBy: string,
    sortDir: number,
    where?: FindConditions<User>
  ): Promise<PaginatedUsers> {
    const total = await this.count(where);
    const pagination = new CalculatePages(page, perPage, total);

    const list = await this.getEntities({
      where,
      take: pagination.perPage,
      skip: pagination.offset,
      order: { [sortBy]: sortDir },
    });

    return new PaginatedUsers(
      pagination.total,
      pagination.pages,
      pagination.perPage,
      pagination.currentPage,
      list
    );
  }

  async loginAttempt(
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<Login | null> {
    email = email.trim().toLowerCase();
    password = password.trim();

    let model = await User.findOne({ email });
    if (!model) return null;

    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    }
    model.roles = roles;

    const now = Math.floor(Date.now() / 1000);
    const today = new Date();
    let date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );
    let expires = Math.floor(date.getTime() / 1000);

    if (remember) {
      expires = now + TOKEN_EXPIRES * 24 * 60 * 60;
      date = new Date(expires * 1000);
    }

    let claimsArray: string[] = [];
    let roleNamesArray: string[] = [];

    if (!model.isSuperAdmin && model.roles.length) {
      for (const role of model.roles) {
        roleNamesArray.push(role.name);
        if (role.name === "admin") {
          role.claims = [];
          for (const [key, value] of Object.entries(claims)) {
            claimsArray.push(value);
          }
        } else {
          if (role.claims.length) {
            for (const roleClaim of role.claims) {
              const claim = `${roleClaim.claimType}:${roleClaim.claimValue}`;
              claimsArray.push(claim);
            }
          }
        }
      }
    }

    if (!model.isSuperAdmin && model.claims.length) {
      for (const userClaim of model.claims) {
        const claim = `${userClaim.claimType}:${userClaim.claimValue}`;
        if (!claimsArray.includes(claim)) claimsArray.push(claim);
      }
    }

    const tokenInfo = new Token(
      this.tokenUser(model),
      model.isSuperAdmin,
      !model.isSuperAdmin && model.roles?.map((e) => e.name).includes("admin"),
      claimsArray,
      roleNamesArray,
      now,
      expires
    );
    const json = JSON.stringify(tokenInfo);
    const token = jwt.sign(JSON.parse(json), TOKEN_SECRET);

    return new Login(model, token, date);
  }

  async forgotPassword(email: string, url: string): Promise<ForgotPassword> {
    let model = await User.findOne({ email });

    if (!model) throw new Error("Usuário não foi encontrado.");
    const expires = DateTime.now().add(1, "day").format(DATE_TIME_FORMAT);

    /**
     * Gera um código de redefinição de senha
     */
    let code = await encrypt.sha224.create();
    code.update(DateTime.now().format(DATE_TIME_FORMAT) + Math.random() * 256);
    const stringCode = code.toString();

    const data = {
      resetCode: stringCode,
      resetExpires: DateTime.toDate(expires),
    };
    model = Object.assign(model, data);
    await model.save();

    url = url
      .replace("{code}", model.resetCode)
      .replace("{email}", encodeURIComponent(email))
      .trim();

    const previewUrl = await SendMailService.execute(
      email,
      `Olá ${model.name}, esqueceu sua senha?`,
      { ...model, url },
      "forgotPassword"
    );

    return new ForgotPassword(
      model.resetCode,
      model.resetExpires,
      url,
      previewUrl
    );
  }

  async resetPassword(
    model: User,
    code: string,
    password: string
  ): Promise<User> {
    if (model.resetCode !== code)
      throw new Error("Código de redefinição inválido.");

    const nowUtc = new Date().getTime() / 1000;
    if (!model.resetExpires)
      throw new Error("O código de redefinição de senha informado já expirou.");
    const expires = new Date(model.resetExpires).getTime() / 1000;
    if (expires < nowUtc)
      throw new Error("O código de redefinição de senha informado já expirou.");

    delete model.roles;
    const salt = await bcrypt.genSaltSync();
    const encryptedPassword = await bcrypt.hashSync(password, salt);

    const data = {
      resetCode: null,
      resetExpires: null,
      password: encryptedPassword,
    };

    model = Object.assign(model, data);
    await model.save();

    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    } else {
      const role = await Role.findOne({ name: "common" });
      if (role) {
        model.roleIds = [role.id];
        roles.push(role);
      }
    }
    model.roles = roles;
    return model;
  }

  async register(data: RegisterInput): Promise<User> {
    const salt = bcrypt.genSaltSync(10);
    data.password = bcrypt.hashSync(data.password.trim(), salt);
    delete data.passwordConfirmation;
    let model = new User();
    model = Object.assign(model, data);
    const role = await Role.findOne({ name: "admin" });
    if (role) {
      model.roleIds.push(role.id);
    }
    model.isActivated = !!!USER_ACTIVATION_EMAIL;
    await model.save();
    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    }
    model.roles = roles;
    if (!!USER_ACTIVATION_EMAIL) {
      await SendMailService.execute(
        USER_ACTIVATION_EMAIL,
        `Olá, o usuário ${model.name} está pendente de ativação!`,
        model,
        "activateUser"
      );
    }
    return model;
  }

  async createEntity(data: UserInput): Promise<User> {
    const salt = bcrypt.genSaltSync(10);
    data.password = bcrypt.hashSync(data.password.trim(), salt);
    let model = new User();
    model = Object.assign(model, data);
    await model.save();
    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    } else {
      const role = await Role.findOne({ name: "common" });
      if (role) {
        model.roleIds = [role.id];
        roles.push(role);
      }
    }
    model.roles = roles;
    return model;
  }

  async updateEntity(model: User, data: UserInput): Promise<User> {
    if (data.password.trim()) {
      const salt = bcrypt.genSaltSync(10);
      data.password = bcrypt.hashSync(data.password.trim(), salt);
    } else {
      delete data.password;
    }
    delete model.roles;
    let roles: Role[] = [];
    let rolesIds: ObjectID[] = [];
    if (data.roleIds.length) {
      for (const roleId of data.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) {
          roles.push(role);
          rolesIds.push(role.id);
        }
      }
    }
    delete data.roleIds;
    model = Object.assign(model, data);
    model.roleIds = rolesIds;
    await model.save();
    model.roles = roles;
    return model;
  }

  async updateProfile(model: User, data: ProfileInput): Promise<User> {
    if (data.password.trim()) {
      const salt = bcrypt.genSaltSync(10);
      data.password = bcrypt.hashSync(data.password.trim(), salt);
    } else {
      delete data.password;
    }
    delete model.roles;
    model = Object.assign(model, data);
    await model.save();
    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    }
    model.roles = roles;
    return model;
  }

  async softDeleteEntity(model: User): Promise<User> {
    let oldModel = new User();
    oldModel = Object.assign(oldModel, model);
    delete model.roles;
    await model.softRemove();
    oldModel = Object.assign(oldModel, model);
    return oldModel;
  }

  async restoreEntity(model: User): Promise<User> {
    let oldModel = new User();
    oldModel = Object.assign(oldModel, model);
    delete model.roles;
    await model.recover();
    oldModel = Object.assign(oldModel, model);
    return oldModel;
  }

  async deleteEntity(model: User): Promise<User> {
    await User.delete(model.id);

    return model;
  }

  async getEntities(options?: FindManyOptions<User>): Promise<User[]> {
    let models = await User.find(options);
    if (models.length) {
      for (let model of models) {
        let roles: Role[] = [];
        if (model.roleIds.length) {
          for (const roleId of model.roleIds) {
            const role = await Role.findOne(roleId);
            if (role) roles.push(role);
          }
        }
        model.roles = roles;
      }
    }
    return models;
  }

  async getEntityById(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<User>
  ): Promise<User> {
    let model = await User.findOne(id, options);
    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    }
    model.roles = roles;
    return model;
  }

  async getEntity(
    conditions?: FindConditions<User>,
    options?: FindOneOptions<User>
  ): Promise<User> {
    let model = await User.findOne(conditions, options);
    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    }
    model.roles = roles;

    return model;
  }

  async entityExists(conditions?: FindManyOptions<User>): Promise<boolean> {
    const count = await User.count(conditions);
    return !!count;
  }

  async deleteProfilePhoto(model: User): Promise<User> {
    delete model.roles;
    if (model.photo) {
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "upload",
        model.photo
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    model.photo = null;
    await model.save();

    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    }
    model.roles = roles;

    return model;
  }

  async uploadProfilePhoto(model: User, file: FileInput): Promise<User> {
    delete model.roles;
    const { createReadStream, filename } = await file;

    const exp = filename.split(".");
    const extension = exp.pop();
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    const newFilename =
      md5(uniqueSuffix.toString()) + "." + extension.trim().toLowerCase();

    const destinationPath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "upload",
      newFilename
    );

    const transformer = sharp().resize({
      width: 200,
      height: 200,
      fit: sharp.fit.cover,
    });

    const response = new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(transformer)
        .pipe(createWriteStream(destinationPath))
        .on("finish", () => resolve(true))
        .on("error", () => reject(false))
    );

    if (response) {
      if (model.photo) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "upload",
          model.photo
        );
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      model.photo = newFilename;
      await model.save();
    }

    let roles: Role[] = [];
    if (model.roleIds.length) {
      for (const roleId of model.roleIds) {
        const role = await Role.findOne(roleId);
        if (role) roles.push(role);
      }
    }
    model.roles = roles;

    return model;
  }
}

export default UsersRepository;
