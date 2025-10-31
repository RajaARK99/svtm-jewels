import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth-client";

export const middleware = createMiddleware().server(async ({ next }) => {
  const { data: session } = await auth.getSession({
    fetchOptions: {
      headers: getRequestHeaders() as HeadersInit,
    },
  });
  return await next({
    context: {
      user: session?.user,
    },
  });
});
