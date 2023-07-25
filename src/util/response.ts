import { APIGatewayProxyResult } from "aws-lambda";

export const constructResponse = (statusCode: number, object: Record<string, any>): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(object),
  };
};
