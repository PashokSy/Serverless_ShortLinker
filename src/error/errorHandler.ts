import { APIGatewayProxyResult } from "aws-lambda";
import { CustomError } from "./customError";

export const errorHandler = (error: unknown): APIGatewayProxyResult => {
  const headers = { "content-type": "application/json" };

  console.log(error);

  if (error instanceof CustomError) {
    return {
      statusCode: error.statusCode,
      headers,
      body: JSON.stringify({
        Error: error.message,
      }),
    };
  } else {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        Error: "Internal server error",
      }),
    };
  }
};
