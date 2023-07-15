import { SQSEvent } from "aws-lambda";
import { SNSClient, SubscribeCommand } from "@aws-sdk/client-sns";

export const main = async (event: SQSEvent) => {
  try {
    const snsClient = new SNSClient({});

    for (let i = 0; i < event.Records.length; i++) {
      const { email, longAlias } = JSON.parse(event.Records[i].body);

      const params = {
        Protocol: "email",
        TopicArn: `Url - ${longAlias} was deactivated`,
        Endpoint: email,
      };

      await snsClient.send(new SubscribeCommand(params));
    }
  } catch (error) {
    throw error;
  }
};
