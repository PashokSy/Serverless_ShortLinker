import { getDynamoClient } from "../util/dynamoClient";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SendMessageCommand, SendMessageCommandInput } from "@aws-sdk/client-sqs";
import { getSQSClient } from "../util/sqsClient";

export const main = async () => {
  try {
    const client = getDynamoClient();
    const sqsClient = getSQSClient();

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
          client.send(
            new PutCommand({
              TableName: process.env.TABLE_NAME,
              Item: currentLink,
            }),
          );

          const input: SendMessageCommandInput = {
            MessageBody: JSON.stringify(currentLink),
            QueueUrl: process.env.QUEUE_URL,
          };

          const command = new SendMessageCommand(input);

          await sqsClient.send(command);
        }
      }
    }
  } catch (error) {
    throw error;
  }
};
