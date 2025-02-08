"use client";

import { ExternalLink, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface AppCardProps {
  id: number;
  name: string;
  fqdn: string;
  firstDeploymentAt: string;
  lastDeployed?: string;
}

export function AppCard({ name, fqdn, firstDeploymentAt, id }: AppCardProps) {
  return (
    <Link href={`/dashboard/applications/${id}`} className="block">
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
        <CardFooter className="bg-muted/50 p-6">
          <div className="flex justify-between items-center w-full">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                window.open(`//${fqdn}`, "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
