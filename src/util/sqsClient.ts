import { SQSClient, SendMessageCommand, SendMessageCommandInput } from "@aws-sdk/client-sqs";

let sqsClient: SQSClient | null = null;

export const getSQSClient = (): SQSClient => {
  return sqsClient ? sqsClient : new SQSClient({});
};

export const sendMessageToQueue = async (messageBody: string): Promise<void> => {
  try {
    sqsClient = sqsClient || getSQSClient();

    const input: SendMessageCommandInput = {
      MessageBody: messageBody,
      QueueUrl: process.env.QUEUE_URL,
    };

    const command = new SendMessageCommand(input);

    await sqsClient.send(command);
  } catch (error) {
    throw error;
  }
};
