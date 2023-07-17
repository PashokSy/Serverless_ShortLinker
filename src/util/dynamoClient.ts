import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const marshallOptions = {
  removeUndefinedValues: true,
  convertClassInstanceToMap: true,
};

const translateConfig = { marshallOptions };

let dynamoDBDocumentClient: DynamoDBDocumentClient | null = null;

export const getDynamoClient = (): DynamoDBDocumentClient => {
  if (dynamoDBDocumentClient) return dynamoDBDocumentClient;

  const dynamoDBClient = new DynamoDBClient({});
  dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, translateConfig);

  return dynamoDBDocumentClient;
};
