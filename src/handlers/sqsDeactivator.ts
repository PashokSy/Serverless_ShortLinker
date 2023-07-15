import { SQSEvent } from "aws-lambda";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { getSecret } from "../util/secret";

export const main = async (event: SQSEvent) => {
  try {
    const sesClient = new SESClient({});

    for (let i = 0; i < event.Records.length; i++) {
      const { user, longAlias } = JSON.parse(event.Records[i].body);

      const sourceEmail = (await getSecret("SourceEmail")) as string;

      const input: SendEmailCommandInput = {
        Source: sourceEmail,
        Destination: {
          ToAddresses: [user],
        },
        Message: {
          Subject: {
            Data: "Deactivation",
            Charset: "UTF-8",
          },
          Body: {
            Text: {
              Data: `Short link for ${longAlias} was deactivated`,
              Charset: "UTF-8",
            },
          },
        },
      };

      await sesClient.send(new SendEmailCommand(input));
    }
  } catch (error) {
    throw error;
  }
};
