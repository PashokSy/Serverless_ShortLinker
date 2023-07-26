import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { decryptToken } from "../util/token";
import { listLinks } from "../data/link";
import { errorHandler } from "../error/errorHandler";
import { constructResponse } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { authorizationToken } = event.headers;
    const authorizerArr = (authorizationToken as string).split(" ");
    const { email } = JSON.parse(await decryptToken(authorizerArr[1]));

    const links = await listLinks(email);

    return constructResponse(200, { listLinks: links });
  } catch (error) {
    return errorHandler(error);
  }
};
