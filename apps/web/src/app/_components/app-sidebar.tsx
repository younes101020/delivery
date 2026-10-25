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
import { useNavigationDictionary, useResourcesDictionary } from "@/app/_ctx/resources-dictionary";

import { useUser } from "../_hooks/use-user";
import { Logo } from "./ui/logo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const navigation = useNavigationDictionary();
  const { locale } = useResourcesDictionary();

  if (!user)
    return null;

  const dataNavMain = [
    { title: navigation.deployments, url: `/${locale}/dashboard/deployments`, icon: Truck, items: [] },
    { title: navigation.applications, url: `/${locale}/dashboard/applications`, icon: Package, isActive: true, items: [{ title: navigation.domainName, url: `/${locale}/dashboard/applications/domain-name` }, { title: navigation.new, url: `/${locale}/dashboard/applications/new` }] },
    { title: navigation.databases, url: `/${locale}/dashboard/databases`, icon: Cuboid, isActive: true, items: [{ title: navigation.hub, url: `/${locale}/dashboard/databases/hub` }] },
    { title: navigation.settings, url: "#", icon: Settings2, isActive: true, items: [{ title: navigation.general, url: `/${locale}/dashboard/settings/general` }, { title: navigation.account, url: `/${locale}/dashboard/settings/account` }, { title: navigation.team, url: `/${locale}/dashboard/settings/team` }] },
  ].map((item) => {
    if (item.title === navigation.applications && user.role !== "owner") {
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
        <NavMain items={dataNavMain} label={navigation.platform} toggleLabel={navigation.toggle} />
        <NavSecondary items={[]} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
