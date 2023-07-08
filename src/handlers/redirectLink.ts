import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getClient } from "../util/client";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const shortALias = event.pathParameters?.shortAlias;
    const client = getClient();

    const input = {
      Key: {
        PK: shortALias,
        SK: shortALias,
      },
      TableName: process.env.TABLE_NAME,
    };

    const output = await client.send(new GetCommand(input));

    return {
      statusCode: 301,
      headers: {
        Location: output.Item?.longAlias,
      },
      body: "",
    };
  } catch (error) {
    throw error;
  }
};
