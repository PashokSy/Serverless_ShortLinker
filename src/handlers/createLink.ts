import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { decryptToken } from "../util/token";
import { Link, generateShortAlias, saveLink } from "../data/link";
import { errorHandler } from "../error/errorHandler";
import { CustomError } from "../error/customError";
import { constructResponse, verifyContentType } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    verifyContentType(event.headers);
    const { longAlias, lifeTime } = JSON.parse(event.body as string);

    if (!longAlias) {
      throw new CustomError(400, "Url not provided");
    }

    if (!lifeTime) {
      throw new CustomError(400, "Lifetime not provided");
    }

    const authorizationToken = event.headers["authorizationtoken"] as string;
    const authorizerArr = authorizationToken.split(" ");
    const { email } = JSON.parse(await decryptToken(authorizerArr[1]));

    const shortAlias = await generateShortAlias();
    const link = new Link(email, longAlias, lifeTime, shortAlias);
    await saveLink(link);

    return constructResponse(201, JSON.stringify({ shortLink: process.env.BASE_URL + link.shortAlias }));
  } catch (error) {
    return errorHandler(error);
  }
};
