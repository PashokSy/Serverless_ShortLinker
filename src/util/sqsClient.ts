import { SQSClient } from "@aws-sdk/client-sqs";

let sqsClient: SQSClient | null = null;

export const getSQSClient = () => {
  if (sqsClient) return sqsClient;

  sqsClient = new SQSClient({});

  return sqsClient;
};
