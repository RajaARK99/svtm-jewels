import {
  Banknote,
  Bot,
  CalendarIcon,
  Frame,
  GemIcon,
  HandCoins,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import type * as React from "react";
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
import { auth } from "@/lib/auth/auth-client";
import { NavPrimary } from "./nav-primary";
import { NavSettings } from "./nav-settings";
import { NavUser } from "./nav-user";

const data = {
  navPrimary: [
    {
      title: "Incentives",
      url: "/incentive",
      icon: Bot,
      items: [
        {
          title: "Converting",
          url: "/converting",
          icon: HandCoins,
        },
        {
          title: "Sales",
          url: "/sales",
          icon: Banknote,
        },
      ],
    },
  ],
  navSettings: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
      items: [
        {
          title: "Users",
          url: "/users",
          icon: UsersIcon,
        },
        {
          title: "Employees",
          url: "/employees",
          icon: Frame,
        },
        {
          title: "Attendance",
          url: "/attendance",
          icon: CalendarIcon,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = auth.useSession();
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
            <NavSettings items={data?.navSettings} />
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
