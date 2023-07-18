import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SESClient, VerifyEmailAddressCommand } from "@aws-sdk/client-ses";
import { User, saveUser } from "../data/user";
import { errorHandler } from "../error/errorHandler";
import { CustomError } from "../error/customError";
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

    const sesClient = new SESClient({});
    await sesClient.send(new VerifyEmailAddressCommand({ EmailAddress: email }));

    const response = await saveUser(user);

    return constructResponse(201, JSON.stringify(response));
  } catch (error) {
    return errorHandler(error);
  }
};
