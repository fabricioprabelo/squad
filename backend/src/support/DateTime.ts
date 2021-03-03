import moment, { Moment } from "moment-timezone";
import { DATE_TIME_FORMAT, TIMEZONE } from "../configs/constants";

class DateTime {
  now(date?: string): Moment {
    if (date) return moment(date).tz(TIMEZONE);
    return moment().tz(TIMEZONE);
  }

  toDate(date?: string): Date {
    if (date)
      return new Date(moment(date).tz(TIMEZONE).format(DATE_TIME_FORMAT));
    return new Date(moment().tz(TIMEZONE).format(DATE_TIME_FORMAT));
  }

  toString(format: string = typeof DATE_TIME_FORMAT, date?: string | Date) {
    if (date) return moment(date).tz(TIMEZONE).format(format);
    return moment().tz(TIMEZONE).format(format);
  }
}

export default new DateTime();
