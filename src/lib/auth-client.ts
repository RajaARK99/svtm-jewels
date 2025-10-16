import { createAuthClient } from "better-auth/react";
// import { clientEnv } from "@/env/client";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3000",
});
