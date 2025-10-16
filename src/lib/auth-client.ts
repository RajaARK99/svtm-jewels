import { createAuthClient } from "better-auth/react";
import { clientEnv } from "@/env/client";

export const authClient = createAuthClient({
	baseURL: clientEnv.VITE_BASE_URL,
});
