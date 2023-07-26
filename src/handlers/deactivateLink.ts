import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deactivateLink } from "../data/link";
import { CustomError } from "../error/customError";
import { errorHandler } from "../error/errorHandler";
import { constructResponse } from "../util/response";
import { decryptToken } from "../util/token";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { link } = JSON.parse(event.body as string);
    const { authorizationToken } = event.headers;
    const authorizerArr = (authorizationToken as string).split(" ");
    const { email } = JSON.parse(await decryptToken(authorizerArr[1]));

    const { baseUrl, shortAlias } = splitLink(link);

    if (baseUrl != process.env.BASE_URL) {
      throw new CustomError(409, "Provided link is invalid");
    }

    await deactivateLink(email, shortAlias);

    return constructResponse(200, { deactivated: `${link}` });
  } catch (error) {
    return errorHandler(error);
  }
};

const splitLink = (link: string): Record<string, string> => {
  const lastIndex = link.lastIndexOf("/");
  return { baseUrl: link.slice(0, lastIndex + 1), shortAlias: link.slice(lastIndex + 1) };
};
