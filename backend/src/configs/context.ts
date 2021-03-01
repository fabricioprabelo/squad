import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Token from "../types/token";
import { errorCode, httpCode, now, TOKEN_SECRET } from "./constants";
import logger from "../utils/logger";
import User from "../types/user";
import RequestLog from "../types/request-log";
import { AuthenticationError } from "apollo-server-express";
import {
  getMongoManager,
  getMongoRepository,
  MongoEntityManager,
  MongoRepository,
} from "typeorm";

export default class Context {
  request: Request;
  response: Response;
  token: Token | null = null;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  currentUser: User | null = null;
  currentUserId: string | null = null;
  userRepository: MongoRepository<User> | null = null;
  manager: MongoEntityManager | null = null;

  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
    this.userRepository = getMongoRepository(User);
    this.manager = getMongoManager();

    if (this.request.headers.authorization) {
      const auth = this.request.headers.authorization;
      const bearer = auth && auth.substring(7);
      try {
        const data = jwt.verify(bearer, TOKEN_SECRET) as Token;
        this.token = data;
        if (
          (this.token && this.token.isSuperAdmin) ||
          (this.token && this.token.isAdmin)
        )
          this.isAdmin = true;
        if (this.token && this.token.isSuperAdmin) this.isSuperAdmin = true;
        if (this.token && this.token.user) this.currentUser = this.token.user;
        if (this.token && this.token.user && this.token.uid)
          this.currentUserId = this.token.uid;
      } catch (err) {
        this.token = null;
        logger(
          `Error while validating authorization token: ${err.message}`,
          "error"
        );
      }
    }
  }

  async getUser(): Promise<User | undefined> {
    const err = new AuthenticationError(
      `Desculpe, mas você não está autenticado.`
    );
    try {
      if (this.token && this.token.user.email) {
        const user = await this.userRepository.findOne({
          email: this.token.user.email,
        });
        if (!user) throw err;
        return user;
      }
      throw err;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async saveAccess() {
    try {
      const xForwardedFor = (
        this.request.headers["x-forwarded-for"]?.toString() || ""
      ).replace(/:\d+$/, "");
      let ip = xForwardedFor || this.request.socket.remoteAddress;
      ip = ip.replace("::ffff:", "");
      const auth = this.request.headers.authorization;
      const authToken = auth && auth.substring(7);

      const user = await User.findOne({
        email: this.token?.user?.email || "xyz",
      });

      const access = {
        token: authToken,
        ipAddress: typeof ip !== "undefined" ? ip : null,
        userAgent: this.request.headers["user-agent"] || null,
        origin: this.request.headers.origin || null,
        referrer: this.request.headers.referer || null,
        requestBody: JSON.stringify(this.request.body) || null,
        userId: user?.id?.toString() || null,
      };

      let requestLog = new RequestLog();
      requestLog = Object.assign(requestLog, access);

      await this.manager.save(requestLog);
    } catch (err) {
      logger(`Erro while saving request log: ${err.message}`, "error");
    }
  }

  isAuthenticatedNotAsync() {
    const err = new AuthenticationError(
      `Desculpe, mas você não está autenticado.`
    );

    if (!this.token) {
      logger(`Authorization error: missing or expired token.`, "error");
      throw err;
    }
  }

  async isAuthenticated(): Promise<undefined> {
    const err = new AuthenticationError(
      `Desculpe, mas você não está autenticado.`
    );

    if (!this.token) {
      logger(`Authorization error: missing or expired token.`, "error");
      throw err;
    }

    return;
  }

  async checkPermission(permission: string): Promise<boolean> {
    if (this.token) {
      let result = false;
      if (this.token.isSuperAdmin || this.token.isAdmin) result = true;
      if (this.token.claims.includes(permission)) result = true;

      return result;
    }

    return false;
  }

  async hasPermission(
    permission: string,
    save: boolean = true
  ): Promise<undefined> {
    const err = new AuthenticationError(
      `Desculpe, mas você não tem acesso com a seguinte permissão: \"${permission}\".`
    );

    if (save) await this.saveAccess();
    if (!permission.trim()) {
      logger(`Authorization error: missing permission in the schema.`, "error");
      throw err;
    }

    if (this.token) {
      let result = false;
      if (this.token.isSuperAdmin || this.token.isAdmin) result = true;
      if (this.token.claims.includes(permission)) result = true;
      if (!result) {
        logger(
          `Authorization error: user is not an administrator or super-administrator does not have permission: "${permission}".`,
          "error"
        );
        throw err;
      }
    } else {
      logger(`Authorization error: missing or expired token.`, "error");
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
      if (this.token.isSuperAdmin || this.token.isAdmin) result = true;
      if (this.token.claims.includes(permission)) result = true;
      return result;
    }

    return false;
  }

  async hasPermissions(
    permissions: string[],
    save: boolean = true
  ): Promise<boolean> {
    if (save) await this.saveAccess();
    if (!permissions?.length) {
      logger(
        `Authorization error: missing permissions in the schema.`,
        "error"
      );
      return false;
    }

    let hasPermissions = true;
    for (const permission of permissions)
      if (!(await this.hasPermission(permission))) hasPermissions = false;

    return hasPermissions;
  }

  async hasAnyPermissions(
    permissions: string[],
    save: boolean = true
  ): Promise<boolean> {
    if (save) await this.saveAccess();
    if (!permissions?.length) {
      logger(
        `Authorization error: missing permissions in the schema.`,
        "error"
      );
      return false;
    }

    let hasPermissions = false;
    for (const permission of permissions)
      if (await this.hasPermission(permission)) hasPermissions = true;

    return hasPermissions;
  }
}
