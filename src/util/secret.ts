import { CreateSecretCommand, GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export const getSecret = async (secretId: string): Promise<string | undefined> => {
  try {
    const client = new SecretsManagerClient({});

    const input = {
      SecretId: secretId,
    };

    const command = new GetSecretValueCommand(input);
    const response = await client.send(command);

    return response.SecretString;
  } catch (error) {
    return undefined;
  }
};

export const createSecret = async (name: string, secret: string) => {
  try {
    const client = new SecretsManagerClient({});

    const input = {
      Name: name,
      SecretString: secret,
    };

    const command = new CreateSecretCommand(input);
    await client.send(command);
  } catch (error) {
    throw error;
  }
};
