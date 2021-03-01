import Email from "email-templates";
import { join } from "path";
import {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  SMTP_ENABLE_SSL,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from "../configs/constants";

const instance = new Email({
  message: {
    from: SMTP_FROM,
  },
  preview: IS_DEVELOPMENT,
  send: IS_PRODUCTION,
  views: {
    root: join(__dirname, "..", "..", "views", "emails"),
  },
  transport: {
    jsonTransport: true,
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_ENABLE_SSL,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  },
});

const mail = async (
  sendTo: string | Array<string>,
  data: any,
  template: string
) => {
  const res = await instance.send({
    template: template,
    message: {
      to: sendTo,
    },
    locals: data,
  });
  console.log(res);
  return res;
};

export default mail;
