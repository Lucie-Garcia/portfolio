import { defineMiddleware } from "astro:middleware";
import { isValidSession } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const isAdmin = context.url.pathname.startsWith("/spoke");
  const isLogin = context.url.pathname === "/spoke/login";

  if (isAdmin && !isLogin && !isValidSession(context.cookies.get("admin")?.value)) {
    return context.redirect("/spoke/login");
  }

  const response = await next();
  if (isAdmin) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
  }
  return response;
});
