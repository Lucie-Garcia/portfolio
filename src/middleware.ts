import { defineMiddleware } from "astro:middleware";
import { isValidSession } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const isAdmin = context.url.pathname.startsWith("/admin");
  const isLogin = context.url.pathname === "/admin/login";

  if (isAdmin && !isLogin && !isValidSession(context.cookies.get("admin")?.value)) {
    return context.redirect("/admin/login");
  }

  const response = await next();
  if (isAdmin) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
  }
  return response;
});
