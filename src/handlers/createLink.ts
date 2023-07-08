import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomBytes } from "crypto";

import { getClient } from "../util/client";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { longAlias, lifeTime } = JSON.parse(event.body as string);

    const shortAlias = randomBytes(4).toString("hex");

    const link = {
      PK: shortAlias,
      SK: shortAlias,
      longAlias,
      shortAlias,
      lifeTime,
      visitCount: 0,
    };

    const client = getClient();

    await client.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: link,
      }),
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ link }),
    };
  } catch (error) {
    throw error;
  }
};
