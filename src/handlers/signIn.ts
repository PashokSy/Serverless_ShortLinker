import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User, verifyUser } from "../data/user";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body as string);
    const user = new User(email, password);

    const response = await verifyUser(user);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify(error.message),
      };
    } else {
      throw error;
    }
  }
};
