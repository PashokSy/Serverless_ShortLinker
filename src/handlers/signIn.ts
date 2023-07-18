import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User, verifyUser } from "../data/user";
import { CustomError } from "../error/customError";
import { errorHandler } from "../error/errorHandler";
import { constructResponse, verifyContentType } from "../util/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    verifyContentType(event.headers);
    const { email, password } = JSON.parse(event.body as string);

    if (!email) {
      throw new CustomError(400, "No email provided");
    }

    if (!password) {
      throw new CustomError(400, "No password provided");
    }

    const user = new User(email, password);

    const response = await verifyUser(user);

    return constructResponse(200, JSON.stringify({ jweToken: response }));
  } catch (error) {
    return errorHandler(error);
  }
};
