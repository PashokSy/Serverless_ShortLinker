import * as crypto from "crypto";
import { createSecret, getSecret } from "./secret";

export const encryptPassword = async (password: string): Promise<string> => {
  try {
    let _salt = await getSecret("PASSWORD_SALT");

    if (!_salt) {
      const salt = crypto.randomBytes(16).toString("hex");
      await createSecret("PASSWORD_SALT", salt);
    }

    _salt = await getSecret("PASSWORD_SALT");
    const hashPassword = crypto.pbkdf2Sync(password, _salt as string, 500, 32, `sha512`).toString("hex");

    return hashPassword;
  } catch (error) {
    throw error;
  }
};

export const verifyPassword = async (password: string, savedPassword: string): Promise<boolean> => {
  try {
    const hashPassword = await encryptPassword(password);
    return hashPassword === savedPassword;
  } catch (error) {
    throw error;
  }
};
