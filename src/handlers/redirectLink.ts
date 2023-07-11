import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getLink } from "../data/link";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const shortAlias = event.pathParameters?.shortAlias as string;

    if (!shortAlias) {
      return notFound();
    }

    const link = await getLink(shortAlias);

    if (!link) {
      return notFound();
    }

    const url = link["longAlias"];

    return {
      statusCode: 301,
      headers: {
        Location: url,
      },
      body: "",
    };
  } catch (error) {
    throw error;
  }
};

const notFound = () => {
  return {
    statusCode: 404,
    headers,
    body: "Short link not found",
  };
};
