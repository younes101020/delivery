"use client";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSelectedLayoutSegments } from "next/navigation";

export function DynamicBreadcrumb() {
  const segments = useSelectedLayoutSegments();
  const withSeparator = segments
    .map((segment, index) =>
      index === segments.length - 1 ? (
        <BreadcrumbItem key={`breadcrumb-${segment}-${index}`}>
          <BreadcrumbPage>{segment}</BreadcrumbPage>
        </BreadcrumbItem>
      ) : (
        [
          <BreadcrumbItem key={`breadcrumb-${segment}-${index}`} className="hidden md:block">
            <BreadcrumbLink href="#">{segment}</BreadcrumbLink>
          </BreadcrumbItem>,
          <BreadcrumbSeparator key={`separator-${segment}-${index}`} className="hidden md:block" />,
        ]
      ),
    )
    .flat();
  return withSeparator.map((segment) => segment);
}
