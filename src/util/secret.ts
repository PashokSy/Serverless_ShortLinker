import {
  CreateSecretCommand,
  GetSecretValueCommand,
  ResourceNotFoundException,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

let smClient: SecretsManagerClient | null = null;

export const getSecret = async (secretName: string): Promise<string | undefined> => {
  try {
    smClient = smClient || new SecretsManagerClient({});

    const input = {
      SecretId: secretName,
    };

    const command = new GetSecretValueCommand(input);
    return (await smClient.send(command)).SecretString;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return undefined;
    } else {
      throw error;
    }
  }
};

export const createSecret = async (secretName: string, secretValue: string) => {
  try {
    smClient = smClient || new SecretsManagerClient({});

    const input = {
      Name: secretName,
      SecretString: secretValue,
    };

    const command = new CreateSecretCommand(input);
    await smClient.send(command);
  } catch (error) {
    throw error;
  }
};
