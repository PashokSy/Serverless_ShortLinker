import { getClient } from "../util/client";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { genToken } from "../util/token";

export class User {
  PK: string;
  SK: string;
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.PK = email;
    this.SK = email;
    this.email = email;
    this.password = password;
  }

  toItem(): Record<string, unknown> {
    return {
      PK: this.PK,
      SK: this.SK,
      email: this.email,
      password: this.password,
    };
  }
}

export const saveUser = async (user: User) => {
  const client = getClient();

  await client.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: user,
    }),
  );

  const jweToken = await genToken(user.toItem());

  return jweToken;
};
