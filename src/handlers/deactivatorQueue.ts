import { SQSEvent } from "aws-lambda";
import { sendEmail } from "../util/sesClient";

export const main = async (event: SQSEvent) => {
  try {
    for (let i = 0; i < event.Records.length; i++) {
      const { user, longLink, shortAlias } = JSON.parse(event.Records[i].body);

      const subject = "Deactivation";
      const message = `Short link ${process.env.BASE_URL}${shortAlias} for ${longLink} was deactivated`;

      await sendEmail(user, subject, message);
    }
  } catch (error) {
    throw error;
  }
};
