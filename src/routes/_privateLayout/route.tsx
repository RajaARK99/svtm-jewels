import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUserID } from "@/lib/auth-server-func";

export const Route = createFileRoute("/_privateLayout")({
	component: RouteComponent,
	beforeLoad: async () => {
		const userID = await getUserID();
		return {
			userID,
		};
	},
	loader: async ({ context }) => {
		if (!context.userID) {
			throw redirect({ to: "/auth/sign-in" });
		}
		return {
			userID: context.userID,
		};
	},
});

function RouteComponent() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
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
