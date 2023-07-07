import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Link, createLink } from "../data/link";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { longAlias, lifeTime } = JSON.parse(event.body as string);

  const link = new Link(longAlias, lifeTime);
  await createLink(link);

  const response = {
    statusCode: 201,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ link }),
  };

  return response;
};
