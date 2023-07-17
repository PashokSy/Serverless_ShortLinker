import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  ListVerifiedEmailAddressesCommand,
} from "@aws-sdk/client-ses";
import { getSecret } from "./secret";

let sesClient: SESClient | null = null;

export const getSESClient = (): SESClient => {
  return sesClient ? sesClient : new SESClient({});
};

export const sendEmail = async (emailAddress: string, subject: string, message: string): Promise<void> => {
  try {
    sesClient = sesClient || getSESClient();

    const sourceEmail = (await getSecret("SourceEmail")) as string;

    const input: SendEmailCommandInput = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [emailAddress],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: message,
            Charset: "UTF-8",
          },
        },
      },
    };

    await sesClient.send(new SendEmailCommand(input));
  } catch (error) {
    throw error;
  }
};

export const listVerifiedEmailAddresses = async (): Promise<string[] | undefined> => {
  try {
    sesClient = sesClient || getSESClient();
    const verifyEmail = await sesClient.send(new ListVerifiedEmailAddressesCommand({}));

    const { VerifiedEmailAddresses } = verifyEmail;

    return VerifiedEmailAddresses;
  } catch (error) {
    throw error;
  }
};
