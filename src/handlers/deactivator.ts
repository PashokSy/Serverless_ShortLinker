import { SQSEvent } from "aws-lambda";
import { getClient } from "../util/client";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

//export const main = async (event): Promise<Handler<SNSEvent | EventBridgeEvent<any, any>>> => {
export const main = async () => {
  try {
    const client = getClient();

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
        }
      }
    }
  } catch (error) {
    throw error;
  }
};
