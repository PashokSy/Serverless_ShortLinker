import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User, saveUser } from "../data/user";

import { SESClient, VerifyEmailAddressCommand } from "@aws-sdk/client-ses";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, password } = JSON.parse(event.body as string);
    const user = new User(email, password);

    const sesClient = new SESClient({});
    await sesClient.send(new VerifyEmailAddressCommand({ EmailAddress: email }));

    const response = await saveUser(user);

    return {
      statusCode: 201,
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
