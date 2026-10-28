import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// MOCKED AUTH: users are picked from a seeded list; the cookie is signed so it
// cannot be forged, but there are no passwords. Documented in README.
export type Session = { userId: number; name: string; email: string };
const COOKIE = "session";

function secret() {
  const s = process.env.AUTH_SECRET || "dev-only-secret-change-me-please-32chars";
  return new TextEncoder().encode(s);
}

export async function createSession(s: Session) {
  const token = await new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7 });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    return { userId: Number(payload.userId), name: String(payload.name), email: String(payload.email) };
  } catch {
    return null;
  }
}
