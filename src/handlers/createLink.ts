import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const ddbDocClient = DynamoDBDocumentClient.from(client);
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    const link = {
      ...reqBody,
      PK: "pk",
      SK: "sk",
    };

    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: link,
      }),
    );

    return {
      statusCode: 201,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ link }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error }),
    };
  }
};
