import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { decryptToken } from "../util/token";
import { listLinks } from "../data/link";
import { CustomError } from "../error/customError";
import { errorHandler } from "../error/errorHandler";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authorizationToken = event.headers["authorizationtoken"] as string;
    const authorizerArr = authorizationToken.split(" ");
    const token = authorizerArr[1];
    const { email } = JSON.parse(await decryptToken(token));

    const links = await listLinks(email);

    if (!links) {
      throw new CustomError(404, `Links for user ${email} not found`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(links),
    };
  } catch (error) {
    return errorHandler(error);
  }
};
