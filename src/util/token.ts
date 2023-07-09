import * as jose from "jose";
import { appendFile } from "node:fs";

export const genToken = async (item: Record<string, unknown>): Promise<string> => {
  try {
    const ALG = "RSA-OAEP-256";
    let _privateKey = null;
    let _publicKey = null;

    if (!process.env.PUBLIC_KEY || !process.env.PRIVATE_KEY) {
      const { publicKey, privateKey } = await jose.generateKeyPair(ALG);
      _privateKey = privateKey;
      _publicKey = publicKey;

      const pkcs8Pem = await jose.exportPKCS8(privateKey);
      const spkiPem = await jose.exportSPKI(publicKey);

      let data = `${"PUBLIC_KEY"}: "${spkiPem}"\n${"PRIVATE_KEY"}: "${pkcs8Pem}"`;

      appendFile("./env.yml", data, (err) => {
        if (err) throw err;
      });
    } else {
      _privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY, ALG);
      _publicKey = await jose.importSPKI(process.env.PUBLIC_KEY, ALG);
    }

    const jweToken = await new jose.CompactEncrypt(new TextEncoder().encode(JSON.stringify(item)))
      .setProtectedHeader({ alg: ALG, enc: "A256GCM" })
      .encrypt(_publicKey);

    return jweToken;
  } catch (error) {
    throw error;
  }
};
