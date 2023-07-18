import { APIGatewayProxyEventHeaders, APIGatewayProxyResult } from "aws-lambda";
import { CustomError } from "../error/customError";

export const constructResponse = (statusCode: number, body: string): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body,
  };
};

export const verifyContentType = (eventHeaders: APIGatewayProxyEventHeaders): void => {
  if (eventHeaders["content-type"] != "application/json") {
    throw new CustomError(415, "Provided media type is unsupported");
  }

  return;
};
