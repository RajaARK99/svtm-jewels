"use client";

import {
	Banknote,
	Bot,
	CircleDollarSign,
	Frame,
	GemIcon,
	HandCoins,
	PieChart,
	SettingsIcon,
	SquareTerminal,
} from "lucide-react";
import type * as React from "react";

import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { NavPrimary } from "./nav-primary";
import { NavSecondary } from "./nav-secondary";

const data = {
	navPrimary: [
		{
			title: "Incentives",
			url: "/incentives",
			icon: Bot,
			items: [
				{
					title: "Converting Incentives",
					url: "/converting-incentives",
					icon: HandCoins,
				},
				{
					title: "Floor Incentives",
					url: "/floor-incentives",
					icon: Banknote,
				},
				{
					title: "Chit Incentives",
					url: "/chit-incentives",
					icon: CircleDollarSign,
				},
			],
		},
	],
	navSecondary: [
		{
			name: "Employees",
			url: "/employees",
			icon: Frame,
		},
		{
			name: "Attendendance",
			url: "/attendance",
			icon: PieChart,
		},
		{
			name: "Settings",
			url: "/settings",
			icon: SettingsIcon,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = authClient.useSession();
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
						<GemIcon className="size-4" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">SVTM Jewels</span>
						<span className="truncate text-xs">Dindugal</span>
					</div>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						<NavPrimary items={data?.navPrimary} />
						<NavSecondary items={data?.navSecondary} />
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						avatar: session?.user?.image ?? undefined,
						email: session?.user?.email ?? "",
						name: session?.user?.name ?? "",
					}}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
