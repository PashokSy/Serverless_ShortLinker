import { SQSEvent } from "aws-lambda";
import { sendEmail } from "../util/sesClient";

export const main = async (event: SQSEvent) => {
  try {
    for (let i = 0; i < event.Records.length; i++) {
      const { user, longAlias } = JSON.parse(event.Records[i].body);

      const subject = "Deactivation";
      const message = `Short link for ${longAlias} was deactivated`;

      await sendEmail(user, subject, message);
    }
  } catch (error) {
    throw error;
  }
};
