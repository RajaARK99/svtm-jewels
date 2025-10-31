import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { api } from "@/lib/orpc/client";
import { LoadingPage } from "./components/ui/loading";
import { NotFoundAnimated } from "./components/ui/not-found-animated";
import {
  Provider,
  queryClient,
} from "./integrations/tanstack-query/root-provider";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { api, queryClient },
    defaultPreload: "intent",
    defaultPendingComponent: () => (
      <LoadingPage
        message="Loading SVTM Jewels"
        description="Preparing your jewelry collection..."
        spinnerType="loader"
        size="lg"
      />
    ),
    defaultNotFoundComponent: () => <NotFoundAnimated />,
    Wrap: (props: { children: React.ReactNode }) => {
      return <Provider queryClient={queryClient}>{props.children}</Provider>;
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};
