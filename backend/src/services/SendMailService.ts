import {
  COMPANY_ADDRESS,
  COMPANY_NAME,
  COMPANY_URL,
  IS_DEVELOPMENT,
  SERVER_URL,
  SMTP_ENABLE_SSL,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from "../configs/constants";
import fs from "fs";
import path from "path";
import Nodemailer, { Transporter } from "nodemailer";
import Logger from "../support/Logger";
import handlebars from "handlebars";
import DateTime from "../support/DateTime";

/**
 * Manages the sending email services.
 * @category Services
 * @class SendMailService
 */
class SendMailService {
  private client: Transporter;

  constructor() {
    if (IS_DEVELOPMENT) {
      Nodemailer.createTestAccount().then((account) => {
        const transporter = Nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
        this.client = transporter;
      });
    } else {
      this.client = Nodemailer.createTransport({
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
      });
    }
  }

  /**
   * Send an email to the specified recipient.
   *
   * @param {string} to The recipient email address.
   * @param {string} subject The message subject.
   * @param {object} variables The variables to parse in the mail template.
   * @param {string} template The email template.
   */
  async execute(
    to: string,
    subject: string,
    variables: object,
    template: string
  ): Promise<string | undefined> {
    const npsHeaderPath = path.resolve(
      __dirname,
      "..",
      "views",
      "emails",
      "partials",
      `head.hbs`
    );
    const npsFooterPath = path.resolve(
      __dirname,
      "..",
      "views",
      "emails",
      "partials",
      `footer.hbs`
    );
    const npsPath = path.resolve(
      __dirname,
      "..",
      "views",
      "emails",
      `${template}.hbs`
    );

    const headFileContent = fs.readFileSync(npsHeaderPath).toString("utf8");
    const footerFileContent = fs.readFileSync(npsFooterPath).toString("utf8");
    const templateFileContent = fs.readFileSync(npsPath).toString("utf8");

    variables = {
      ...variables,
      company_name: COMPANY_NAME,
      company_url: COMPANY_URL,
      company_address: COMPANY_ADDRESS,
      server_url: SERVER_URL,
      current_year: DateTime.now().format("YYYY"),
    };

    handlebars.registerPartial("head", headFileContent);
    handlebars.registerPartial("footer", footerFileContent);
    const mailTemplateParse = handlebars.compile(templateFileContent);
    const html = mailTemplateParse(variables);

    try {
      const message = await this.client.sendMail({
        to,
        subject,
        html,
        from: IS_DEVELOPMENT
          ? "NPS <noreplay@nps.com.br>"
          : `${COMPANY_NAME} <${SMTP_FROM}>`,
      });

      Logger.info(`Mensagem enviada: ${message.messageId}`);
      if (IS_DEVELOPMENT) {
        const previewUrl = Nodemailer.getTestMessageUrl(message);
        Logger.info(`URL de visualização: ${previewUrl}`);
        return previewUrl.toString();
      }

      return;
    } catch (err) {
      Logger.error(
        `Ocorreu um erro ao tentar envia e-mail: ${err.message}\n${err.stack}`
      );
    }
  }
}

export default new SendMailService();
