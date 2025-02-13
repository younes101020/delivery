"use client";

import { useSelectedLayoutSegments } from "next/navigation";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/_components/ui/breadcrumb";

export function DynamicBreadcrumb() {
  const segments = useSelectedLayoutSegments();
  const withSeparator = segments
    .map((segment, index) => {
      const href = `/dashboard/${segments.slice(0, index + 1).join("/")}`;

      return index === segments.length - 1
        ? (
            <BreadcrumbItem key={`breadcrumb-${segment}-${index}`}>
              <BreadcrumbPage>{segment}</BreadcrumbPage>
            </BreadcrumbItem>
          )
        : (
            [
              <BreadcrumbItem key={`breadcrumb-${segment}-${index}`} className="hidden md:block">
                <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
              </BreadcrumbItem>,
              <BreadcrumbSeparator key={`separator-${segment}-${index}`} className="hidden md:block" />,
            ]
          );
    })
    .flat();
  return withSeparator.map(segment => segment);
}
