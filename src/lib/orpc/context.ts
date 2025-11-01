import { db } from "@/db";
import { auth } from "@/lib/auth/auth";

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    session,
    headers: req.headers,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
