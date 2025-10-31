import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getuserId } from "@/lib/auth/server-fn";

export const Route = createFileRoute("/_public")({
  component: RouteComponent,
  beforeLoad: async () => {
    const userId = await getuserId();
    return {
      userId,
    };
  },
  loader: ({ context }) => {
    if (context.userId) {
      throw redirect({ to: "/" });
    }
    return {
      userId: context.userId,
    };
  },
});

function RouteComponent() {
  return <Outlet />;
}
