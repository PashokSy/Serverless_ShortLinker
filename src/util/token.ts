import * as jose from "jose";
import { createSecret, getSecret } from "./secret";

const ALG = "RSA-OAEP-256";

export const genToken = async (item: Record<string, unknown>): Promise<string> => {
  try {
    let _publicKey = await getSecret("PUBLIC_KEY");

    if (!_publicKey) {
      const { publicKey, privateKey } = await jose.generateKeyPair(ALG);

      const pkcs8Pem = await jose.exportPKCS8(privateKey);
      const spkiPem = await jose.exportSPKI(publicKey);

      await createSecret("PRIVATE_KEY", pkcs8Pem);
      await createSecret("PUBLIC_KEY", spkiPem);
    }

    _publicKey = await getSecret("PUBLIC_KEY");

    const publicKeyLike = await jose.importSPKI(_publicKey as string, ALG);

    const jweToken = await new jose.CompactEncrypt(new TextEncoder().encode(JSON.stringify(item)))
      .setProtectedHeader({ alg: ALG, enc: "A256GCM" })
      .encrypt(publicKeyLike);

    return jweToken;
  } catch (error) {
    throw error;
  }
};

export const decryptToken = async (token: string): Promise<string> => {
  try {
    const _privateKey = await getSecret("PRIVATE_KEY");
    const privateKeyLike = await jose.importPKCS8(_privateKey as string, ALG);

    const decryptResult = await jose.compactDecrypt(token, privateKeyLike);

    const data = new TextDecoder().decode(decryptResult.plaintext);

    return data;
  } catch (error) {
    throw error;
  }
};
