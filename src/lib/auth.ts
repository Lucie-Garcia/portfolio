import crypto from "node:crypto";

const sessionSecret = import.meta.env.SESSION_SECRET ?? "";
const sessionDuration = 2 * 60 * 60 * 1000;

function sign(value: string) {
  return crypto.createHmac("sha256", sessionSecret).update(value).digest("hex");
}

function safeEqual(left: Buffer, right: Buffer) {
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyPassword(input: string) {
  const [salt, expected] = (import.meta.env.ADMIN_PASSWORD_HASH ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .split(":", 2);
  if (!salt || !expected) return false;

  const actual = crypto.scryptSync(input, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return expectedBuffer.length === actual.length && safeEqual(expectedBuffer, actual);
}

export function createSession() {
  const expiresAt = String(Date.now() + sessionDuration);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSession(token: string | undefined) {
  if (!token || !sessionSecret) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;
  return safeEqual(Buffer.from(signature), Buffer.from(sign(expiresAt)));
}

const attempts = new Map<string, { count: number; resetAt: number }>();

export function allowAttempt(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= 5;
}
