"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useFetch } from "@/app/_lib/fetch-provider";

import type { ApplicationsDomainConfiguration } from "../_lib/queries";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../_components/ui/table";

export function DNSRecords() {
  return (
    <div className="col-span-3 lg:col-span-1 pt-4">
      <div className="overflow-x-hidden">
        <p className="bg-secondary text-secondary-foreground w-fit px-2 text-sm truncate">step 2: Add this DNS record into your registrar.</p>
      </div>
      <Separator className="mt-2" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="text-right">TTL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">A</TableCell>
            <TableCell>*</TableCell>
            <Suspense fallback={<PendingTableCell />}>
              <DNSRecordsTable />
            </Suspense>
            <TableCell className="text-right">Auto</TableCell>
          </TableRow>

        </TableBody>
      </Table>
    </div>

  );
}

function DNSRecordsTable() {
  const { fetcher } = useFetch();
  const applicationsDomainConfiguration = useSuspenseQuery<ApplicationsDomainConfiguration>({
    queryKey: ["application-domain-configuration"],
    queryFn: () => fetcher("/api/application-domain-configuration"),
  });
  return (<TableCell>{applicationsDomainConfiguration.data ? applicationsDomainConfiguration.data.publicIp : "Your server public IP"}</TableCell>

  );
}

function PendingTableCell() {
  return <TableCell><Skeleton className="w-full" /></TableCell>;
}
