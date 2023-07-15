import { getClient } from "../util/client";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SQSClient, CreateQueueCommand, CreateQueueCommandInput } from "@aws-sdk/client-sqs";

export const main = async () => {
  try {
    const client = getClient();
    const sqsClient = new SQSClient({ region: "eu-central-1" });

    const input = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: "attribute_exists(deactivated) AND deactivated <> :deactivated AND deactivateAt <> :Null",
      ExpressionAttributeValues: {
        ":deactivated": true,
        ":Null": null,
      },
    };
    const output = await client.send(new ScanCommand(input));

    const linksArr = output.Items;

    if (typeof linksArr != "undefined" && linksArr.length != 0) {
      for (let i = 0; i < linksArr.length; i++) {
        const currentLink = linksArr[i];
        const lifetime = currentLink["deactivateAt"] - Date.now();
        if (lifetime <= 0) {
          currentLink["deactivated"] = true;
          //client.send(
          //  new PutCommand({
          //    TableName: process.env.TABLE_NAME,
          //    Item: currentLink,
          //  }),
          //);

          const input: CreateQueueCommandInput = {
            QueueName: "deactivated",
            Attributes: {
              email: currentLink["user"],
              longAlias: currentLink["longAlias"],
            },
          };

          const command = new CreateQueueCommand(input);

          await sqsClient.send(command);
        }
      }
    }
  } catch (error) {
    throw error;
  }
};
