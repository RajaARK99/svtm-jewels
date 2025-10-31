import { protectedProcedure } from "@/lib/orpc";
import { convertingIncentiveRouter } from "./converting";
import { saleIncentiveRoute } from "./sales";

const incentivesRouter = protectedProcedure
  .prefix("/incentives")
  .tag("Incentives")
  .router({
    convertingIncentiveRouter,
    saleIncentiveRoute,
  });

  export { incentivesRouter };