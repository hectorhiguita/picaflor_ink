import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/server/db";

const AUTH_COOKIE = "picaflor_auth";
const PBKDF2_ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST)
    .toString("hex");

  return `${PBKDF2_ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [iterationsRaw, salt, hash] = stored.split(":");
  const iterations = Number(iterationsRaw);
  if (!iterations || !salt || !hash) return false;

  const candidate = crypto
    .pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST)
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

export function signAuthToken(userId: string): string {
  const secret = getAuthSecret();
  const payload = Buffer.from(
    JSON.stringify({ userId, issuedAt: Date.now() })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyAuthToken(token: string): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = crypto
    .createHmac("sha256", getAuthSecret())
    .update(payload)
    .digest("base64url");

  if (
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  const parsed = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8")
  ) as { userId?: string };

  return typeof parsed.userId === "string" ? parsed.userId : null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const userId = token ? verifyAuthToken(token) : null;

  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
}

export function setAuthCookie(response: Response, userId: string): void {
  const cookie = `${AUTH_COOKIE}=${signAuthToken(userId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
  response.headers.append("Set-Cookie", cookie);
}

export function clearAuthCookie(response: Response): void {
  response.headers.append(
    "Set-Cookie",
    `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

function getAuthSecret(): string {
  return process.env.NEXTAUTH_SECRET ?? "picaflor-dev-secret";
}

