import { DynamoDB } from "aws-sdk";

let client: DynamoDB.DocumentClient | null = null;

export const getClient = (): DynamoDB.DocumentClient => {
  if (client) return client;
  client = new DynamoDB.DocumentClient();
  return client;
};
