import { getClient } from "../util/client";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { genToken } from "../util/token";
import { encryptPassword, verifyPassword } from "../util/password";

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

export const verifyUser = async (user: User): Promise<string> => {
  try {
    const client = getClient();

    const foundUser = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
      }),
    );

    if (!foundUser.Item) {
      throw new Error("User not found");
    }

    const savedUser = foundUser.Item;
    const passVerified = await verifyPassword(user.password, savedUser.password);

    if (!passVerified) {
      throw new Error("Wrong password");
    }

    const jweToken = await genToken(savedUser);
    return jweToken;
  } catch (error) {
    throw error;
  }
};

export const saveUser = async (user: User) => {
  try {
    const client = getClient();

    const foundUser = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
      }),
    );

    if (!foundUser.Item) {
      user.password = await encryptPassword(user.password);

      await client.send(
        new PutCommand({
          TableName: process.env.TABLE_NAME,
          Item: user,
        }),
      );

      const jweToken = await genToken(user.toItem());

      return jweToken;
    } else {
      throw new Error("User exists");
    }
  } catch (error) {
    throw error;
  }
};
