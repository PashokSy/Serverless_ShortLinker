import {} from "aws-lambda";
import { getClient } from "../util/client";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const main = async () => {
  try {
    const client = getClient();

    const input = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: "deactivated <> :deactivated AND deactivateAt <> :deactivateNull",
      ExpressionAttributeValues: {
        ":deactivated": true,
        ":deactivateNull": null,
      },
    };
    const output = await client.send(new ScanCommand(input));

    const linksArr = output.Items;

    if (typeof linksArr != "undefined" && linksArr.length != 0) {
      for (let i = 0; i < linksArr.length; i++) {
        const currentLink = linksArr[i];
        const lifetime = currentLink["deactivateAt"] - currentLink["createdAt"];
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
