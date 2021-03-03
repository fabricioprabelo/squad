import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Token from "../types/Token";
import { TOKEN_SECRET } from "../configs/constants";
import User from "../types/User";
import { AuthenticationError } from "apollo-server-express";
import Logger from "../support/Logger";
import UsersRepository from "../repositories/UsersRepository";
import { getCustomRepository } from "typeorm";

/**
 * The Apollo Server Context object that's passed to every resolver that executes
 * for a particular operation. This enables resolvers to share helpful context,
 * such as a database connection.
 *
 * Certain fields are added to this object automatically, depending on which Node.js
 * middleware your server uses.
 * @category Support
 * @class Context
 */
export default class Context {
  request: Request;
  response: Response;
  token: Token | null = null;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  currentUser: User | null = null;
  currentUserId: string | null = null;
  usersRepository: UsersRepository;

  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
    this.usersRepository = getCustomRepository(UsersRepository);

    if (this.request.headers.authorization) {
      const auth = this.request.headers.authorization;
      const bearer = auth && auth.substring(7);
      try {
        const data = jwt.verify(bearer, TOKEN_SECRET) as Token;
        this.token = data;
        if ((this.token && this.token.spa) || (this.token && this.token.adm))
          this.isAdmin = true;
        if (this.token && this.token.spa) this.isSuperAdmin = true;
        if (this.token && this.token.usr) this.currentUser = this.token.usr;
        if (this.token && this.token.usr && this.token.uid)
          this.currentUserId = this.token.uid;
      } catch (err) {
        this.token = null;
        Logger.error(
          `Error while validating authorization token: ${err.message}`
        );
      }
    }
  }

  async getUser(): Promise<User | undefined> {
    const err = new AuthenticationError(
      `Desculpe, mas você não está autenticado.`
    );
    try {
      if (this.token && this.token.usr.email) {
        const user = await this.usersRepository.getEntity({
          email: this.token.usr.email,
        });
        if (!user) throw err;
        return user;
      }
      throw err;
    } catch (err) {
      Logger.error(
        `Falha ao obter usuário no contexto: ${err.message}\n${err.stack}`
      );
      throw new Error(err.message);
    }
  }

  isAuthenticatedNotAsync() {
    const err = new AuthenticationError(
      `Desculpe, mas você não está autenticado.`
    );

    if (!this.token) {
      Logger.error(`Authorization error: missing or expired token.`);
      throw err;
    }
  }

  async isAuthenticated(): Promise<undefined> {
    const err = new AuthenticationError(
      `Desculpe, mas você não está autenticado.`
    );

    if (!this.token) {
      Logger.error(`Authorization error: missing or expired token.`);
      throw err;
    }

    return;
  }

  async checkPermission(permission: string): Promise<boolean> {
    if (this.token) {
      let result = false;
      if (this.token.spa || this.token.adm) result = true;
      if (this.token.clm.includes(permission)) result = true;

      return result;
    }

    return false;
  }

  async hasPermission(permission: string): Promise<undefined> {
    const err = new AuthenticationError(
      `Desculpe, mas você não tem acesso com a seguinte permissão: \"${permission}\".`
    );

    if (!permission.trim()) {
      Logger.error(`Erro de autorização: falta de permissão no esquema.`);
      throw err;
    }

    if (this.token) {
      let result = false;
      if (this.token.spa || this.token.adm) result = true;
      if (this.token.clm.includes(permission)) result = true;
      if (!result) {
        Logger.error(
          `Erro de autorização: O usuário não é um administrador ou o superadministrador não tem permissão: "${permission}".`
        );
        throw err;
      }
    } else {
      Logger.error(`Erro de autorização: token ausente ou expirado.`);
      throw new Error(
        "Sua sessão expirou, atualize a página para fazer login novamente."
      );
    }

    return;
  }

  hasPermissionWithReturn(permission: string): boolean {
    if (!permission.trim()) {
      return false;
    }

    if (this.token) {
      let result = false;
      if (this.token.spa || this.token.adm) result = true;
      if (this.token.clm.includes(permission)) result = true;
      return result;
    }

    return false;
  }

  async hasPermissions(permissions: string[]): Promise<boolean> {
    if (!permissions?.length) {
      Logger.error(`Erro de autorização: permissões ausentes no esquema.`);
      return false;
    }

    let hasPermissions = true;
    for (const permission of permissions)
      if (!(await this.hasPermission(permission))) hasPermissions = false;

    return hasPermissions;
  }

  async hasAnyPermissions(permissions: string[]): Promise<boolean> {
    if (!permissions?.length) {
      Logger.error(`Erro de autorização: permissões ausentes no esquema.`);
      return false;
    }

    let hasPermissions = false;
    for (const permission of permissions)
      if (await this.hasPermission(permission)) hasPermissions = true;

    return hasPermissions;
  }
}
