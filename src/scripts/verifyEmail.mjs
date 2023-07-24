import { SESClient, ListVerifiedEmailAddressesCommand, VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

try {
  const sesClient = new SESClient({});
  const { VerifiedEmailAddresses } = await sesClient.send(new ListVerifiedEmailAddressesCommand({}));

  const secretClient = new SecretsManagerClient({});
  const { SecretString } = await secretClient.send(new GetSecretValueCommand({ SecretId: "EMAIL_FROM" }));

  if (!VerifiedEmailAddresses || !VerifiedEmailAddresses.includes(SecretString)) {
    await sesClient.send(new VerifyEmailIdentityCommand({ EmailAddress: SecretString }));
  }
} catch (error) {
  console.log({ error, Tip: "Email must be added to secret service" });
}
