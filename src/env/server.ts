import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
	server: {
		DATABASE_URL: z.url(),
		CORS_ORIGIN: z.url(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
