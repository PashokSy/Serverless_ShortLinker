import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const marshallOptions = {
  removeUndefinedValues: true, // false, by default.
};

const translateConfig = { marshallOptions };

export const getClient = (): DynamoDBDocumentClient => {
  const dynamoDBClient = new DynamoDBClient({});
  const dynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, translateConfig);

  return dynamoDBDocumentClient;
};