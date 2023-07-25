import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { decryptToken } from "../util/token";
import { listLinks } from "../data/link";
import { errorHandler } from "../error/errorHandler";
import { constructResponse } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authorizationToken = event.headers["authorizationtoken"] as string;
    const authorizerArr = authorizationToken.split(" ");
    const token = authorizerArr[1];
    const { email } = JSON.parse(await decryptToken(token));

    const links = await listLinks(email);

    return constructResponse(200, { listLinks: links });
  } catch (error) {
    return errorHandler(error);
  }
};
