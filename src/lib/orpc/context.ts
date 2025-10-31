import { auth } from "@/lib/auth/auth";
import { db } from "@/db";

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
