"use client";

import { useSelectedLayoutSegments } from "next/navigation";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/_components/ui/breadcrumb";

export function DynamicBreadcrumb() {
  const allSegments = useSelectedLayoutSegments();
  const routedSegments = allSegments.filter(segment => !segment.includes("("));

  const withSeparator = routedSegments
    .map((segment, index) => {
      const href = `/dashboard/${routedSegments.slice(0, index + 1).join("/")}`;

      return index === routedSegments.length - 1
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
