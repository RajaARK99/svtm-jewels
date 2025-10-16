import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "@/env/client";

const baseURL= clientEnv.VITE_BASE_URL;
export const authClient = createAuthClient({
	baseURL,
	plugins: [adminClient()],
});
