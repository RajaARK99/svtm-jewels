import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import "dotenv/config";
import { serverEnv } from "@/env/server";

const sql = neon(serverEnv.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export { db };
