import { createHash } from "crypto";

const PASSWORD_SALT = process.env.APP_PASSWORD_SALT ?? "collector-garage-password-salt";

export function hashPassword(password: string) {
  return createHash("sha256").update(`${PASSWORD_SALT}:${password}`).digest("hex");
}

export function verifyPassword(password: string, passwordHash?: string | null) {
  if (!passwordHash) return false;
  return hashPassword(password) === passwordHash;
}