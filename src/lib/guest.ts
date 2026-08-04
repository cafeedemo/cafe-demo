import { cookies } from "next/headers";

const KEY_COOKIE = "lc_guest";
const NAME_COOKIE = "lc_guest_name";
const ONE_YEAR = 60 * 60 * 24 * 365;

export type GuestProfile = { guestKey: string; name: string | null };

/**
 * Guests never sign up. The first time someone scans a table QR (or picks a
 * table by hand) we mint an anonymous key and remember their name in a cookie.
 * From then on ordering and "My Orders" work with nothing to fill in.
 */
export async function readGuest(): Promise<GuestProfile | null> {
  const jar = await cookies();
  const guestKey = jar.get(KEY_COOKIE)?.value;
  if (!guestKey) return null;
  return { guestKey, name: jar.get(NAME_COOKIE)?.value ?? null };
}

/**
 * Only callable from a Server Action or Route Handler — Next.js forbids setting
 * cookies while rendering.
 */
export async function rememberGuest(name: string): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(KEY_COOKIE)?.value;
  const guestKey = existing ?? crypto.randomUUID();

  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  };

  jar.set(KEY_COOKIE, guestKey, options);
  jar.set(NAME_COOKIE, name, { ...options, httpOnly: false });

  return guestKey;
}

export async function forgetGuest(): Promise<void> {
  const jar = await cookies();
  jar.delete(KEY_COOKIE);
  jar.delete(NAME_COOKIE);
}
