import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import {
  convert_to_date,
  date,
  DATE_TIME_FORMAT,
  now,
  policies,
  TOKEN_EXPIRES,
  TOKEN_SECRET,
  USER_ACTIVATION_EMAIL,
} from "../configs/constants";
import Context from "../configs/context";
import Role from "../types/role";
import User, { ProfileInput, RegisterInput } from "../types/user";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import encrypt from "js-sha256";
import bcrypt from "bcrypt";
import Token from "../types/token";
import { ForgotPassword, Login } from "../types/account";
import { createWriteStream } from "fs";
import FileInput from "../types/file";
import { GraphQLUpload } from "apollo-server-express";
import md5 from "md5";
import Yup from "../configs/yup";
import mail from "../utils/mail";

@Resolver()
export default class Accounts {
  unknowRecordMessage = "Usuário não encontrado.";
  unknowProfileMessage = "Perfil de usuário não encontrado.";
  userAlreadyInUse = "Este e-mail já está em uso.";
  errorWhileSavingRecord = "Ocorreu um erro ao tentar salvar o registro.";

  @Query(() => Login)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("remember", { nullable: true }) remember: boolean = false
  ): Promise<Login | undefined> {
    try {
      email = email.trim().toLowerCase();
      password = password.trim();

      const data = { email, password };

      const schema = Yup.object().shape({
        password: Yup.string().required(),
        email: Yup.string().email().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const model = await User.findOne({ email });
      if (!model) throw new Error(this.unknowRecordMessage);

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

      const passwordEquals = await bcrypt.compareSync(
        password,
        model?.password
      );
      if (!passwordEquals)
        throw new Error("Password does not match that of the informed user.");

      if (!model.isActivated)
        throw new Error("Inactivated user, please contact an administrator.");

      let claimsArray: string[] = [];
      let roleNamesArray: string[] = [];
      let roles: Role[] = [];

      if (!model.isSuperAdmin && model.roleIds.length) {
        for (const roleId of model.roleIds) {
          const role = await Role.findOne(roleId);
          if (role) {
            roles.push(role);
            roleNamesArray.push(role.name);
            if (role.name === "admin") {
              role.claims = [];
              for (const [key, value] of Object.entries(policies)) {
                claimsArray.push(value);
              }
            } else {
              if (role?.claims?.length) {
                for (const roleClaim of role.claims) {
                  const claim = `${roleClaim.claimType}:${roleClaim.claimValue}`;
                  claimsArray.push(claim);
                }
              }
            }
          }
        }
      }
      model.roles = roles;

      if (!model.isSuperAdmin && model.claims.length) {
        for (const userClaim of model.claims) {
          const claim = `${userClaim.claimType}:${userClaim.claimValue}`;
          if (!claimsArray.includes(claim)) claimsArray.push(claim);
        }
      }

      let spa = false;
      if (model.isSuperAdmin) spa = true;

      const usr = await User.findOne(model.id);
      delete usr.password;
      delete usr.resetCode;
      delete usr.resetExpires;
      delete usr.roleIds;
      delete usr.claims;
      delete usr.roles;
      delete usr.isSuperAdmin;
      delete usr.isActivated;
      delete usr.createdAt;
      delete usr.updatedAt;
      delete usr.deletedAt;

      const tokenInfo = new Token(
        usr,
        model.roles?.map((e) => e.name).includes("admin") || spa,
        claimsArray,
        roleNamesArray,
        now,
        expires
      );
      const json = JSON.stringify(tokenInfo);
      const token = jwt.sign(JSON.parse(json), TOKEN_SECRET);

      return new Login(model, token, date);
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Query(() => ForgotPassword)
  async forgotPassword(
    @Arg("email") email: string,
    @Arg("url") url: string
  ): Promise<ForgotPassword | undefined> {
    try {
      email = email?.trim()?.toLowerCase();
      url = url?.trim();

      const data = { email, url };

      const schema = Yup.object().shape({
        url: Yup.string().required(),
        email: Yup.string().email().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const model = await User.findOne({ email });

      if (!model)
        throw new Error(`Nenhum usuário encontrado com o e-mail: ${email}`);

      const expires = date().add(1, "day").format(DATE_TIME_FORMAT);
      /**
       * Gera um código de redefinição de senha
       */
      let code = await encrypt.sha224.create();
      code.update(now() + Math.random() * 256);
      const stringCode = code.toString();

      model.resetCode = stringCode;
      model.resetExpires = convert_to_date(expires);

      await model.save();

      url = url
        .replace("{code}", stringCode)
        .replace("{email}", encodeURIComponent(email))
        .trim();

      const forgotPassword = new ForgotPassword(
        stringCode,
        convert_to_date(expires),
        url
      );
      const mailData = { ...model, ...forgotPassword };

      await mail(
        email,
        `Olá ${model.name}, esqueceu sua senha?`,
        mailData,
        "forgot-password"
      )
        .then((res) => {
          logger("E-mail de recuperação de senha enviado com sucesso.");
        })
        .catch((err) => {
          logger(
            `Ocorreu um erro ao tentar enviar e-mail de recuperação de senha: ${err.message}\n${err.stack}`
          );
        });

      return forgotPassword;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async resetPassword(
    @Arg("email") email: string,
    @Arg("code") code: string,
    @Arg("password") password: string
  ): Promise<User | undefined> {
    try {
      email = email?.trim()?.toLowerCase();
      code = code?.trim();
      password = password?.trim();

      const data = { email, code, password };

      const schema = Yup.object().shape({
        password: Yup.string().required(),
        code: Yup.string().required(),
        email: Yup.string().email().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const model = await User.findOne({ email });
      if (!model)
        throw new Error(
          "Nenhum usuário foi encontrado com o e-mail não informado."
        );
      if (model.resetCode !== code)
        throw new Error("Código de redefinição inválido.");

      const nowUtc = new Date().getTime() / 1000;
      if (!model.resetExpires)
        throw new Error(
          "O código de redefinição de senha informado já expirou."
        );
      const expires = new Date(model.resetExpires).getTime() / 1000;
      if (expires < nowUtc)
        throw new Error(
          "O código de redefinição de senha informado já expirou."
        );

      const salt = await bcrypt.genSaltSync();
      model.password = await bcrypt.hashSync(password, salt);
      model.resetCode = null;
      model.resetExpires = null;

      await model.save();

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async register(@Arg("data") data: RegisterInput): Promise<User | undefined> {
    try {
      data.name = data.name?.trim() || "";
      data.surname = data.surname?.trim() || "";
      data.email = data.email?.trim()?.toLowerCase() || "";
      data.password = data.password?.trim() || "";
      data.passwordConfirmation = data.passwordConfirmation?.trim() || "";

      const input = {
        name: data.name,
        surname: data.surname,
        email: data.email,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      };

      const schema = Yup.object().shape({
        passwordConfirmation: Yup.string()
          .required()
          .oneOf([Yup.ref("password"), null], "As senhas devem corresponder."),
        password: Yup.string().required("Senha é obrigatória."),
        email: Yup.string().email().required(),
        surname: Yup.string().required(),
        name: Yup.string().required(),
      });

      await schema.validate(input, {
        abortEarly: true,
      });

      const hasUser = await User.count({ email: data.email });
      if (hasUser) throw new Error(this.userAlreadyInUse);

      const salt = bcrypt.genSaltSync(10);
      data.password = bcrypt.hashSync(data.password.trim(), salt);

      let model = new User();
      model.name = data.name;
      model.surname = data.surname;
      model.document = data?.document?.trim()?.replace(/\D/g, "") || null;
      model.birthDate = data?.birthDate || null;
      model.email = data.email;
      model.password = data.password;
      model.phone = data?.phone || null;
      model.mobile = data?.mobile || null;

      let roles = [];
      const role = await Role.findOne({ name: "common" });
      if (role) {
        roles.push(role);
        model.roleIds.push(role.id.toString());
      }

      await model.save();
      if (!model.id) throw new Error(this.errorWhileSavingRecord);

      model.roles = roles;

      await mail(
        USER_ACTIVATION_EMAIL,
        `Olá, o usuário ${model.name} está pendente de ativação!`,
        data,
        "activate-user"
      )
        .then((res) => {
          logger("E-mail de ativação de usuário enviado com sucesso.");
        })
        .catch((err) => {
          logger(
            `Ocorreu um erro ao tentar enviar e-mail de ativação de usuário: ${err.message}\n${err.stack}`
          );
        });

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async profile(
    @Arg("data") data: ProfileInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      if (!ctx || !(ctx && ctx.currentUserId))
        throw new Error(this.unknowProfileMessage);

      let model = await User.findOne(ctx.currentUserId);
      if (!model) throw new Error(this.unknowProfileMessage);

      if (data.password?.trim()) {
        const salt = bcrypt.genSaltSync(10);
        model.password = bcrypt.hashSync(data.password.trim(), salt);
      }

      model.name = data.name;
      model.surname = data.surname;
      model.document = data?.document?.trim()?.replace(/\D/g, "") || null;
      model.birthDate = data?.birthDate || null;
      model.email = data.email;
      model.phone = data?.phone || null;
      model.mobile = data?.mobile || null;

      await model.save();

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async deleteProfilePhoto(@Ctx() ctx?: Context): Promise<User | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      if (!ctx || !(ctx && ctx.currentUserId))
        throw new Error(this.unknowProfileMessage);

      let model = await User.findOne(ctx.currentUserId);
      if (!model) throw new Error(this.unknowProfileMessage);

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

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }

  @Mutation(() => User)
  async profileAvatarUpload(
    @Arg("file", () => GraphQLUpload) file: FileInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      if (!ctx || !(ctx && ctx.currentUserId))
        throw new Error(this.unknowProfileMessage);

      let model = await User.findOne(ctx.currentUserId);
      if (!model) throw new Error(this.unknowProfileMessage);

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

      const resolution = new Promise(async (resolve, reject) =>
        createReadStream()
          .pipe(createWriteStream(destinationPath))
          .on("finish", () => resolve(true))
          .on("error", () => reject(false))
      );

      if (resolution) {
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

      return model;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
