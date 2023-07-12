import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deactivateLink } from "../data/link";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { link } = JSON.parse(event.body as string);
    const arr = (link as string).split("/");
    const shortAlias = arr[arr.length - 1];

    await deactivateLink(shortAlias);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ deactivated: `${link}` }),
    };
  } catch (error) {
    throw error;
  }
};
