import type { RouterClient } from "@orpc/server";
import { attendanceRouter } from "./attendance";
import { employeeRouter } from "./employee";
import { incentivesRouter } from "./incentives";
import { getOptions } from "./options";
import { userRouter } from "./user";

export const appRouter = {
  employeeRouter,
  getOptions,
  attendanceRouter,
  incentivesRouter,
  userRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
