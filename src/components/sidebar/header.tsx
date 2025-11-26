import { useLocation, useSearch } from "@tanstack/react-router";
import { HomeIcon, Moon, Sun } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "../theme-provider";

function segmentToTitle(segment: string) {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isUUID(value: string) {
  // Normalize spaces to hyphens for UUID validation
  const normalized = value.replace(/\s+/g, "-");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    normalized,
  );
}

export function SiteHeader() {
  const { setTheme } = useTheme();
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, idx) => {
    const href = `/${segments.slice(0, idx + 1).join("/")}`;
    return {
      href,
      label: segmentToTitle(seg),
      isLast: idx === segments.length - 1,
    };
  });

  const search = useSearch({
    strict: false,
  });


  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem key={"home"}>
              <BreadcrumbLink href="/">
                <HomeIcon size={16} aria-hidden="true" />
                <span className="sr-only">Home</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.length > 0 && (
              <BreadcrumbSeparator> / </BreadcrumbSeparator>
            )}
            {crumbs.map((c) => (
              <Fragment key={c.href}>
                <BreadcrumbItem>
                  {c.isLast || (search.date && isUUID(c.label)) ? (
                    <BreadcrumbPage>
                      {search.date && isUUID(c.label) ? search.date : c.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={
                        c.label === "Incentive"
                          ? "/incentive/converting"
                          : c.href
                      }
                    >
                      {search.date && isUUID(c.label) ? search.date : c.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!c.isLast && <BreadcrumbSeparator> / </BreadcrumbSeparator>}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
