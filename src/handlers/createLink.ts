import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { decryptToken } from "../util/token";
import { Link, createLinkDeactivationEvent, generateShortAlias, saveLink } from "../data/link";
import { errorHandler } from "../error/errorHandler";
import { CustomError } from "../error/customError";
import { constructResponse } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { longLink, lifeTime } = JSON.parse(event.body as string);

    if (!longLink) {
      throw new CustomError(400, "Url not provided");
    }

    const { authorizationToken } = event.headers;
    const authorizerArr = (authorizationToken as string).split(" ");
    const { email } = JSON.parse(await decryptToken(authorizerArr[1]));

    const shortAlias = await generateShortAlias();
    const link = new Link(email, longLink, lifeTime, shortAlias);
    await saveLink(link);
    createLinkDeactivationEvent(link.lifetime, link.createdAt, link.PK);

    return constructResponse(201, { shortLink: process.env.BASE_URL + link.shortAlias });
  } catch (error) {
    return errorHandler(error);
  }
};
