import Queue, { QueueOptions } from "bull";
import {
  CACHE_REDIS_HOST,
  CACHE_REDIS_PASS,
  CACHE_REDIS_PORT,
  QUEUE_ATTEMPTS,
  QUEUE_BACKOFF,
  QUEUE_DELAY,
  USER_ACTIVATION_EMAIL,
} from "../configs/constants";
import logger from "./logger";
import mail from "./mail";
import { JobOptions } from "bull";

const dispatchOptions: JobOptions = {
  attempts: QUEUE_ATTEMPTS,
  backoff: QUEUE_BACKOFF,
  delay: QUEUE_DELAY,
  removeOnComplete: false,
  removeOnFail: false,
};
const options: QueueOptions = {
  redis: {
    port: CACHE_REDIS_PORT,
    host: CACHE_REDIS_HOST,
    password: CACHE_REDIS_PASS,
  },
  prefix: "bull",
};

const forgotPasswordQueue = new Queue("forgot-password", options);
const activateUserQueue = new Queue("activate-user", options);

forgotPasswordQueue.process(async (job, done) => {
  await mail(job.data.email, job.data, "forgot-password")
    .then((res: Promise<any>) => {
      logger(
        `Password recovery email sent successfully.\n${JSON.stringify(res)}`
      );
      done(null, res);
    })
    .catch((err: any) => {
      logger(
        `Error trying to send password recovery email: \n${err.message}\n${err.stack}`,
        "error"
      );
      done(err);
    });
});
activateUserQueue.process(async (job, done) => {
  await mail(USER_ACTIVATION_EMAIL, job.data, "activate-user")
    .then((res: Promise<any>) => {
      logger(
        `User activation email sent successfully.\n${JSON.stringify(res)}`
      );
      done(null, res);
    })
    .catch((err: any) => {
      logger(
        `Error trying to send user activation email: \n${err.message}\n${err.stack}`,
        "error"
      );
      done(err);
    });
});

const queue = async (
  job: "forgot-password-mail" | "activate-user-mail",
  data: object
) => {
  switch (job) {
    case "forgot-password-mail":
      await forgotPasswordQueue.add(data, dispatchOptions);
      break;
    case "activate-user-mail":
      await activateUserQueue.add(data, dispatchOptions);
      break;
  }
};

export default queue;
