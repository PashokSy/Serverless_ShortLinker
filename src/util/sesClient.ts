import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";

let sesClient: SESClient | null = null;

export const getSESClient = (): SESClient => {
  return sesClient ? sesClient : new SESClient({});
};

export const sendEmail = async (emailAddress: string, subject: string, message: string): Promise<void> => {
  try {
    sesClient = sesClient || getSESClient();

    const sourceEmail = process.env.EMAIL_FROM;

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
