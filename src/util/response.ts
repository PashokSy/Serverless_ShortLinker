import { APIGatewayProxyResult } from "aws-lambda";

export const constructResponse = (statusCode: number, object: object): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(object),
  };
};
