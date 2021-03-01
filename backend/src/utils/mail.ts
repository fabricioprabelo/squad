import { join } from "path";
import {
  COMPANY_ADDRESS,
  SITE_NAME,
  SMTP_ENABLE_SSL,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from "../configs/constants";
import nodemailer from "nodemailer";
import pug from "pug";
import { TwingEnvironment, TwingLoaderArray } from "twing";
import fs from "fs";
import logger from "./logger";

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_ENABLE_SSL, // true for 465, false for other ports
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: SMTP_USER, // generated ethereal user
    pass: SMTP_PASS, // generated ethereal password
  },
});

const mail = async (
  to: string,
  subject: string,
  data: object,
  template: string
) => {
  const templateName = `${template}.twig`;
  const from = `"CRM ${SITE_NAME}" <${SMTP_FROM}>`;
  const basePath = join(__dirname, "..", "..", "views", "emails");
  const layoutPath = join(basePath, "layout", "default.twig");
  const templatePath = join(basePath, `${template}.twig`);

  data = {
    ...data,
    site_name: SITE_NAME,
    site_url: "",
    company_address: COMPANY_ADDRESS,
  };

  try {
    var baseContent = fs.readFileSync(layoutPath, "utf8");
    var templateContent = fs.readFileSync(templatePath, "utf8");

    let loader = new TwingLoaderArray({
      "default.twig": baseContent,
      [templateName]: templateContent,
    });
    let twing = new TwingEnvironment(loader);

    const html = await twing.render(templateName, data).then((output) => {
      return output;
    });

    await transporter.sendMail({
      to,
      from,
      html,
      subject,
    });
  } catch (err) {
    logger(
      `Ocorreu um erro ao tentar envia e-mail: ${err.message}\n${err.stack}`,
      "error"
    );
  }
};

export default mail;
