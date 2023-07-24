import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { redirectLink } from "../data/link";
import { CustomError } from "../error/customError";
import { errorHandler } from "../error/errorHandler";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const shortAlias = event.pathParameters?.shortAlias as string;

    if (!shortAlias) {
      throw new CustomError(404, "Short link not found");
    }

    const link = await redirectLink(shortAlias);

    if (!link) {
      throw new CustomError(404, "Short link not found");
    }

    const { longLink } = link;

    return {
      statusCode: 301,
      headers: {
        Location: longLink,
      },
      body: "",
    };
  } catch (error) {
    return errorHandler(error);
  }
};
