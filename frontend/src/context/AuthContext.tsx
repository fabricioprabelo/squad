import { createContext, useState, ReactNode } from "react";
import User from "../models/User";
import jwt from "jsonwebtoken";

export interface IAuthContext {
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  user: User;
  login(email: string, password: string, remember?: boolean): Promise<boolean>;
  logout(): void;
  hasPermission(permission: string): boolean;
  hasPermissions(permission: string[]): boolean;
  hasAnyPermission(permissions: string[]): boolean;
}

interface IAuthProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default function AuthProvider({ children }: IAuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return false;
  });
  <AuthContext.Provider value={{
    isLoggedIn,
  }}>
    {children}
  </AuthContext.Provider>
}
