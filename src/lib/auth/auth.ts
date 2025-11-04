import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { reactStartCookies } from "better-auth/react-start";
import { config } from "dotenv";
import { db } from "@/db";
import * as schema from "@/db/schema/index";
import { env } from "@/env/server";
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

config();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    reactStartCookies(),
    adminPlugin({
      ac,
      roles:
      {
        admin,
        employee,
      }
    }),
  ],
  user: {
    deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,
    },
  },
});
