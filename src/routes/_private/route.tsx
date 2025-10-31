import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getuserId } from "@/lib/auth/server-fn";

export const Route = createFileRoute("/_private")({
  component: RouteComponent,
  beforeLoad: async () => {
    const userId = await getuserId();
    return {
      userId,
    };
  },
  loader: ({ context }) => {
    if (!context.userId) {
      throw redirect({ to: "/auth/sign-in" });
    }
    return {
      userId: context.userId,
    };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 54)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
