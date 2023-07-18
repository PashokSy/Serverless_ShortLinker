import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { genToken } from "../util/token";
import { encryptPassword, verifyPassword } from "../util/password";
import { CustomError } from "../error/customError";
import { getDynamoDBDocumentClient } from "../util/dynamoClient";

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

  static fromItem = (item: Record<string, unknown>): User => {
    return new User(item.email as string, item.password as string);
  };
}

export const getUser = async (user: User): Promise<Record<string, any> | undefined> => {
  const dynamoClient = getDynamoDBDocumentClient();

  return (
    await dynamoClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: user.PK,
          SK: user.SK,
        },
      }),
    )
  ).Item;
};

export const verifyUser = async (user: User): Promise<string> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    const savedUser = await getUser(user);

    if (!savedUser) {
      throw new CustomError(404, "User not found");
    }

    const passVerified = await verifyPassword(user.password, savedUser.password);

    if (!passVerified) {
      throw new CustomError(403, "Wrong password provided");
    }

    return await genToken(savedUser);
  } catch (error) {
    throw error;
  }
};

export const saveUser = async (user: User): Promise<string> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    const foundUser = (
      await dynamoClient.send(
        new GetCommand({
          TableName: process.env.TABLE_NAME,
          Key: {
            PK: user.PK,
            SK: user.SK,
          },
        }),
      )
    ).Item;

    if (!foundUser) {
      user.password = await encryptPassword(user.password);

      await dynamoClient.send(
        new PutCommand({
          TableName: process.env.TABLE_NAME,
          Item: user,
        }),
      );

      return await genToken(user.toItem());
    } else {
      throw new CustomError(409, "User already exists");
    }
  } catch (error) {
    throw error;
  }
};
