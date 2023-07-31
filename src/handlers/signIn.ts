import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User, verifyUser } from "../data/user";
import { errorHandler } from "../error/errorHandler";
import { constructResponse } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body as string);

    const user = new User(email, password);

    const jweToken = await verifyUser(user);

    return constructResponse(200, { jweToken });
  } catch (error) {
    return errorHandler(error);
  }
};
