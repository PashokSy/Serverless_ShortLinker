import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { decryptToken } from "../util/token";
import { Link, generateShortAlias, saveLink } from "../data/link";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { longAlias, lifeTime } = JSON.parse(event.body as string);
    const authorizationToken = event.headers["authorizationtoken"] as string;
    const authorizerArr = authorizationToken.split(" ");
    const token = authorizerArr[1];
    const { email } = JSON.parse(await decryptToken(token));
    const shortAlias = await generateShortAlias();
    const link = new Link(email, longAlias, lifeTime, shortAlias);
    await saveLink(link);

    const host = event.headers["host"] as string;
    const response = host + "/" + shortAlias;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ shortLink: response, longLink: longAlias }),
    };
  } catch (error) {
    throw error;
  }
};
