import { createServerFn } from "@tanstack/react-start";
import { middleware } from "./middleware";

export const getuserId = createServerFn({ method: "GET" })
  .middleware([middleware])
  .handler(async ({ context }) => context?.user?.id ?? null);
