import { createContext, useState, ReactNode } from "react";
import User from "../models/User";
import jwt from "jsonwebtoken";
import {
  TOKEN_SECRET,
  GRAPHQL_SERVER,
  GRAPHQL_SERVER_PATH,
  IS_DEVELOPMENT,
  SITE_NAME
} from "../configs/constants";
import Token from "../models/Token";
import { ApolloProvider, gql } from '@apollo/client';
import {
  ApolloLink,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import SweetAlert from "sweetalert2";
import { Login } from "../models/Account";

export interface IAuthContext {
  loading: boolean;
  toggleLoading(): void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  user: User | null;
  login(email: string, password: string, remember: boolean): Promise<boolean>;
  logout(): void;
  hasPermission(permission: string): boolean;
  hasPermissions(permission: string[]): boolean;
  hasAnyPermissions(permissions: string[]): boolean;
  apolloError(error: any): void;
  client: ApolloClient<NormalizedCacheObject>;
}

interface IAuthProviderProps {
  children?: ReactNode
}

interface ILoginQuery {
  login: Login;
}

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default function AuthProvider({ children }: IAuthProviderProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<Token | null>(() => {
    const token = localStorage.getItem('token');
    if (!!token) {
      try {
        const data = jwt.verify(token, TOKEN_SECRET) as Token;
        const expires = new Date(data.exp * 1000);
        if (expires > new Date()) return data;
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    return null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!!user && !!token) {
      try {
        const data = jwt.verify(token, TOKEN_SECRET) as Token;
        const expires = new Date(data.exp * 1000);
        if (expires > new Date()) return true;
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    return false;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!!user && !!token) {
      try {
        const data = jwt.verify(token, TOKEN_SECRET) as Token;
        const expires = new Date(data.exp * 1000);
        if (expires > new Date()) return data.adm;
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    return false;
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!!user && !!token) {
      try {
        const data = jwt.verify(token, TOKEN_SECRET) as Token;
        const expires = new Date(data.exp * 1000);
        if (expires > new Date()) return data.spa;
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    return false;
  });
  const [user, setUser] = useState<User | null>(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!!user && !!token) {
      try {
        const data = jwt.verify(token, TOKEN_SECRET) as Token;
        const expires = new Date(data.exp * 1000);
        if (expires > new Date()) return data.usr;
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    return null;
  });

  // Instantiate required constructor fields
  const httpLink: ApolloLink = createHttpLink({
    uri: `${GRAPHQL_SERVER}${GRAPHQL_SERVER_PATH}`,
  });

  // Initiate authenticated link
  const authLink: ApolloLink = setContext((_, { headers, ...context }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('token');
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
      ...context,
    };
  });

  // Initiate apollo client
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
    connectToDevTools: IS_DEVELOPMENT,
    name: SITE_NAME,
    version: "v1",
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
      mutate: {
        fetchPolicy: "no-cache",
      },
    },
  });

  function apolloError(error: any) {
    if (error?.graphQLErrors?.length) {
      error?.graphQLErrors?.map((err: any) => {
        if (typeof err?.extensions?.exception?.validationErrors !== "undefined") {
          err?.extensions?.exception?.validationErrors.map((val: any) => {
            if (typeof val.constraints !== "undefined") {
              Object.keys(val.constraints).forEach((key) => {
                SweetAlert.fire({
                  title: "Erro",
                  icon: "error",
                  text: val.constraints[key],
                });
              });
            } else {
              SweetAlert.fire({
                title: "Erro",
                icon: "error",
                text: error.message,
              });
            }
            return val;
          });
        } else {
          SweetAlert.fire({
            title: "Erro",
            icon: "error",
            text: error.message,
          });
        }
        return err;
      });
    } else if (error?.response?.data?.message) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: error.response.data.message,
      });
    } else if (error?.response?.data?.errors) {
      let message: string = "";
      for (const err of error.response.data.errors) {
        if (err?.message) message += err.message + "<br />";
      }
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: message,
      });
    } else if (error?.message) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        html: error.message,
      });
    } else {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: error,
      });
    }
  }

  async function login(email: string, password: string, remember: boolean = false) {
    email = email.trim().toLowerCase();
    password = password.trim();

    return await client.query<ILoginQuery>({
      query: gql`
        query login($email: String!, $password: String!, $remember: Boolean) {
          login(email: $email, password: $password, remember: $remember) {
            user {
              id
              name
              surname
              email
              isActivated
              isSuperAdmin
              photo
              claims {
                claimType
                claimValue
              }
              roles {
                id
                name
                description
              }
            }
            token
          }
        }
      `,
      variables: { email, password, remember }
    })
      .then(res => {
        const user = res.data.login.user;
        const token = String(res.data.login.token);

        try {
          const data = jwt.verify(token, TOKEN_SECRET) as Token;
          const expires = new Date(data.exp * 1000);
          if (expires > new Date()) setToken(data);
        } catch {
          setToken(null);
          localStorage.removeItem("token");
        }

        setUser(user);
        setIsLoggedIn(true);
        setIsAdmin(user?.roles?.map(role => role.name).includes("admin") || false);
        setIsSuperAdmin(user?.isActivated || false);

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        return true;
      })
      .catch(err => {
        apolloError(err);
        return false;
      });
  };

  function logout() {
    setIsAdmin(false);
    setIsLoggedIn(false);
    setIsSuperAdmin(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function hasPermission(permission: string) {
    if (token) {
      const isAdmin = token.rol.includes("admin");
      const isSuperAdmin = token.spa;
      const hasPermission = token.clm.includes(permission);
      if (isSuperAdmin || isAdmin || hasPermission) return true;
    }
    return false;
  }

  function hasPermissions(permissions: string[]) {
    let hasAllPermissions = true;
    for (const permission of permissions) if (!hasPermission(permission)) hasAllPermissions = false;
    return hasAllPermissions;
  }

  function hasAnyPermissions(permissions: string[]) {
    let hasAnyPermissions = false;
    for (let permission of permissions) if (hasPermission(permission)) hasAnyPermissions = true;
    return hasAnyPermissions;
  }

  const toggleLoading = () => setLoading(!loading);

  return (
    <AuthContext.Provider value={{
      loading,
      toggleLoading,
      isLoggedIn,
      isAdmin,
      isSuperAdmin,
      user,
      login,
      logout,
      hasPermission,
      hasPermissions,
      hasAnyPermissions,
      apolloError,
      client
    }}>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </AuthContext.Provider>
  )
}
