import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User, saveUser } from "../data/user";
import { errorHandler } from "../error/errorHandler";
import { CustomError } from "../error/customError";
import { constructResponse } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body as string);

    if (!email) {
      throw new CustomError(400, "No email provided");
    }

    if (!password) {
      throw new CustomError(400, "No password provided");
    }

    const user = new User(email, password);

    const response = await saveUser(user);

    return constructResponse(201, { jweToken: response });
  } catch (error) {
    return errorHandler(error);
  }
};
