import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deactivateLink } from "../data/link";
import { CustomError } from "../error/customError";
import { errorHandler } from "../error/errorHandler";
import { constructResponse, verifyContentType } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    verifyContentType(event.headers);
    const { link } = JSON.parse(event.body as string);

    if (!link) {
      throw new CustomError(400, "No link provided");
    }

    const arr = (link as string).split("/");
    const shortAlias = arr[arr.length - 1];

    await deactivateLink(shortAlias);

    return constructResponse(200, JSON.stringify({ deactivated: `${link}` }));
  } catch (error) {
    return errorHandler(error);
  }
};
