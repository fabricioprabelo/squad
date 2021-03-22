import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import Context from "../support/Context";
import User, { ProfileInput, RegisterInput } from "../types/User";
import bcrypt from "bcrypt";
import { ForgotPassword, Login } from "../types/Account";
import FileInput from "../types/File";
import {
  AuthenticationError,
  GraphQLUpload,
  ValidationError,
} from "apollo-server-express";
import Yup from "../configs/yup";
import UsersRepository from "../repositories/UsersRepository";
import Logger from "../support/Logger";
import { getCustomRepository } from "typeorm";

@Resolver()
export default class Accounts {
  usersRepository: UsersRepository;
  unknowRecordMessage = "Usuário não encontrado.";
  unknowProfileMessage = "Perfil de usuário não encontrado.";
  userAlreadyInUse = "Este e-mail já está em uso.";
  errorWhileSavingRecord = "Ocorreu um erro ao tentar salvar o registro.";

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  }

  @Query(() => Login)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("remember", { nullable: true }) remember: boolean = false
  ): Promise<Login | undefined> {
    try {
      email = email?.trim()?.toLowerCase();
      password = password?.trim();

      const data = { email, password };

      const schema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const model = await this.usersRepository.loginAttempt(
        email,
        password,
        remember
      );
      if (!model) throw new Error("Usuário não foi encontrado.");

      if (!model.user.isActivated)
        throw new Error(
          "Usuário desativado, entre em contato com um administrador."
        );

      const passwordEquals = await bcrypt.compareSync(
        password,
        model.user.password
      );
      if (!passwordEquals)
        throw new Error("A senha não corresponde ao usuário informado.");

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Query(() => User)
  async profile(@Ctx() ctx?: Context): Promise<User | undefined> {
    try {
      const model = await ctx.getUser();

      return model;
    } catch (err) {
      Logger.error(err);
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

      const model = await this.usersRepository.forgotPassword(email, url);

      return model;
    } catch (err) {
      Logger.error(err);
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

      await this.usersRepository.resetPassword(model, code, password);

      return model;
    } catch (err) {
      Logger.error(err);
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

      const schema = Yup.object().shape({
        passwordConfirmation: Yup.string()
          .required()
          .oneOf([Yup.ref("password"), null], "As senhas devem corresponder."),
        password: Yup.string().required("Senha é obrigatória."),
        email: Yup.string().email().required(),
        surname: Yup.string().required(),
        name: Yup.string().required(),
      });

      await schema.validate(data, {
        abortEarly: true,
      });

      const hasUser = await this.usersRepository.entityExists({
        where: { email: data.email },
      });
      if (hasUser) throw new Error(this.userAlreadyInUse);

      const model = await this.usersRepository.register(data);
      if (!model) throw new Error(this.errorWhileSavingRecord);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async updateProfile(
    @Arg("data") data: ProfileInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      if (!ctx || !(ctx && ctx.currentUserId))
        throw new Error(this.unknowProfileMessage);

      let model = await this.usersRepository.getEntityById(ctx.currentUserId);
      if (!model) throw new Error(this.unknowProfileMessage);

      if (data.password?.trim()) {
        const salt = bcrypt.genSaltSync(10);
        model.password = bcrypt.hashSync(data.password.trim(), salt);
      }

      await this.usersRepository.updateProfile(model, data);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async deleteProfilePhoto(@Ctx() ctx?: Context): Promise<User | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      if (!ctx || !(ctx && ctx.currentUserId))
        throw new Error(this.unknowProfileMessage);

      let model = await this.usersRepository.getEntityById(ctx.currentUserId);
      if (!model) throw new Error(this.unknowProfileMessage);

      await this.usersRepository.deleteProfilePhoto(model);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }

  @Mutation(() => User)
  async uploadProfilePhoto(
    @Arg("file", () => GraphQLUpload) file: FileInput,
    @Ctx() ctx?: Context
  ): Promise<User | undefined> {
    ctx && (await ctx.isAuthenticated());

    try {
      if (!ctx || !(ctx && ctx.currentUserId))
        throw new Error(this.unknowProfileMessage);

      let model = await User.findOne(ctx.currentUserId);
      if (!model) throw new Error(this.unknowProfileMessage);

      await this.usersRepository.uploadProfilePhoto(model, file);

      return model;
    } catch (err) {
      Logger.error(err);
      return err;
    }
  }
}
