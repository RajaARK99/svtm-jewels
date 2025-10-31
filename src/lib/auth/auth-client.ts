import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "@/env/client";
import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  project: ["read", "create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);


export const admin = ac.newRole({
  project: [...statement.project],
});

export const employee = ac.newRole({
  project: ["read"],
});
const baseURL = clientEnv.VITE_BASE_URL;
export const auth = createAuthClient({
  baseURL,
  plugins: [adminClient({
    ac,
    roles: {
      admin,
      employee,
    },
  })],
});
