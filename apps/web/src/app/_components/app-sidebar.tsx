"use client";

import { Cuboid, Package, Settings2, Truck } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/app/_components/nav-main";
import { NavSecondary } from "@/app/_components/nav-secondary";
import { NavUser } from "@/app/_components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/_components/ui/sidebar";

import { Logo } from "./ui/logo";

const data = {
  navMain: [
    {
      title: "Deployments",
      url: "/dashboard/deployments",
      icon: Truck,
      items: [],
    },
    {
      title: "Applications",
      url: "/dashboard/applications",
      icon: Package,
      items: [
        {
          title: "New",
          url: "/dashboard/applications/new",
        },
      ],
    },
    {
      title: "Databases",
      url: "/dashboard/databases",
      icon: Cuboid,
      items: [
        {
          title: "Hub",
          url: "/dashboard/databases/hub",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/settings/general",
        },
        {
          title: "Account",
          url: "/dashboard/settings/account",
        },
        { title: "Team", url: "/dashboard/settings/team" },
      ],
    },
  ],
  navSecondary: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <Logo className="w-full flex justify-center" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
