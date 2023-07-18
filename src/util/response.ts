import { APIGatewayProxyResult } from "aws-lambda";

export const constructResponse = (statusCode: number, body: string): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body,
  };
};
