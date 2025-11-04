import { adminClient } from "better-auth/client/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "@/env/client";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";



export const statement = {
  ...defaultStatements,
  project: ["read", "create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  project: [...statement.project],
  ...adminAc.statements, 
});

export const employee = ac.newRole({
  project: ["read"],
});
const baseURL = clientEnv.VITE_BASE_URL;
export const auth = createAuthClient({
  baseURL,
  plugins: [
    adminClient({
       ac,
      roles:
      {
        admin,
        employee,
      }
}),
  ],
});
