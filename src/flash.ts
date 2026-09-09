import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import type { FlashMessage } from "./views/layout";

const COOKIE_NAME = "flash";

export function setFlash(c: Context, category: string, message: string) {
  setCookie(c, COOKIE_NAME, JSON.stringify({ category, message }), {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 30,
  });
}

export function consumeFlash(c: Context): FlashMessage[] {
  const raw = getCookie(c, COOKIE_NAME);
  if (!raw) return [];
  deleteCookie(c, COOKIE_NAME, { path: "/" });
  try {
    const parsed = JSON.parse(raw) as FlashMessage;
    return [parsed];
  } catch {
    return [];
  }
}
