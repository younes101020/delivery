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

import { useUser } from "../_hooks/use-user";
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
      isActive: true,
      items: [
        {
          title: "Domain name",
          url: "/dashboard/applications/domain-name",
        },
        {
          title: "New",
          url: "/dashboard/applications/new",
        },
      ],
    },
    {
      title: "Databases",
      url: "/dashboard/databases",
      isActive: true,
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
      open: true,
      isActive: true,
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
  const { user } = useUser();

  if (!user)
    return null;

  const dataNavMain = data.navMain.map((item) => {
    if (item.title === "Applications" && user.role !== "owner") {
      return {
        ...item,
        items: item.items?.filter(subItem => subItem.title !== "New"),
      };
    }
    return item;
  });

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
        <NavMain items={dataNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
