"use client";

import { Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";

import { redeploy } from "../actions";

interface ContainerOptionsProps {
  containerId: string;
  applicationName: string;
};

export function AppOptions({ applicationName }: ContainerOptionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Button
            className="text-xs border-none"
            variant="outline"
            onClick={async () => {
              setIsLoading(true);
              await redeploy(applicationName);
              setIsLoading(false);
            }}
          >
            {isLoading
              ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                )
              : (
                  "Redeploy"
                )}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
