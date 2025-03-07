"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";

interface AppCardProps {
  name: string;
  firstDeploymentAt: string;
  lastDeployed?: string;
}

export function AppCard({ name, firstDeploymentAt }: AppCardProps) {
  return (
    <Link href={`/dashboard/applications/${name}`} className="block">
      <Card className="w-full transition-all">
        <CardContent className="p-6 bg-sidebar/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold truncate">{name}</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More options"
              onClick={e => e.preventDefault()}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <dl className="text-xs pt-2">
            <dt className="text-muted-foreground">First deployment at</dt>
            <dd className="text-xs">{firstDeploymentAt}</dd>
          </dl>
        </CardContent>
      </Card>
    </Link>
  );
}
