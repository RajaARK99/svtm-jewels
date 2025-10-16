import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { serverEnv } from "@/env/server";
import "dotenv/config";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	trustedOrigins: [serverEnv.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	plugins: [reactStartCookies()],
});

export type Session = typeof auth.$Infer.Session;
