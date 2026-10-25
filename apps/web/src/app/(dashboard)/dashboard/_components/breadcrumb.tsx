"use client";

import { useSelectedLayoutSegments } from "next/navigation";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/_components/ui/breadcrumb";
import { useNavigationDictionary, useResourcesDictionary } from "@/app/_ctx/resources-dictionary";

export function DynamicBreadcrumb() {
  const allSegments = useSelectedLayoutSegments();
  const navigation = useNavigationDictionary();
  const { locale } = useResourcesDictionary();
  const routedSegments = allSegments.filter(segment => !segment.includes("("));
  const labels: Record<string, string> = {
    "deployments": navigation.deployments,
    "applications": navigation.applications,
    "domain-name": navigation.domainName,
    "new": navigation.new,
    "databases": navigation.databases,
    "hub": navigation.hub,
    "settings": navigation.settings,
    "general": navigation.general,
    "account": navigation.account,
    "team": navigation.team,
  };

  const withSeparator = routedSegments
    .map((segment, index) => {
      const href = `/${locale}/dashboard/${routedSegments.slice(0, index + 1).join("/")}`;
      const label = labels[segment] ?? segment;

      return index === routedSegments.length - 1
        ? (
            <BreadcrumbItem key={`breadcrumb-${segment}-${index}`}>
              <BreadcrumbPage>{label}</BreadcrumbPage>
            </BreadcrumbItem>
          )
        : (
            [
              <BreadcrumbItem key={`breadcrumb-${segment}-${index}`} className="hidden md:block">
                <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
              </BreadcrumbItem>,
              <BreadcrumbSeparator key={`separator-${segment}-${index}`} className="hidden md:block" />,
            ]
          );
    })
    .flat();
  return withSeparator.map(segment => segment);
}
