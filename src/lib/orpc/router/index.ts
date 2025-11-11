import type { RouterClient } from "@orpc/server";
import { attendanceRouter } from "./attendance";
import { employeeRouter } from "./employee";
import { incentivesRouter } from "./incentives";
import { getOptions } from "./options";
import { userRouter } from "./user";
import { dashboardRouter } from "./dashboard";

export const appRouter = {
  employeeRouter,
  getOptions,
  attendanceRouter,
  incentivesRouter,
  userRouter,
  dashboardRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
