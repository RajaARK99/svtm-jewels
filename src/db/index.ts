import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env/server";
import * as schema from "./schema";

config();

const sql = neon(env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

export { db };
