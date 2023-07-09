import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User, saveUser } from "../data/user";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body as string);
    const user = new User(email, password);

    const response = await saveUser(user);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    throw error;
  }
};
