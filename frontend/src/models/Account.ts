import User from "./User";

export interface Login {
  user: User | null;
  token: string | null;
  expires: Date | null;
}

export interface ForgotPassword {
  code: string | null;
  url: string | null;
  previewUrl: string | null;
  expires: string | null;
}
