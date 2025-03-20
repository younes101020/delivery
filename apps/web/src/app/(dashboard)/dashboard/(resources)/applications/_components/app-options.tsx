"use client";

import { Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Separator } from "@/app/_components/ui/separator";

import { redeploy, removeApplication } from "../actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./../../../_components/ui/alert-dialog";

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
        <DropdownMenuItem onClick={async () => {
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
        </DropdownMenuItem>
        <Separator />
        <DeleteOption applicationName={applicationName} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DeleteOptionProps {
  applicationName: ContainerOptionsProps["applicationName"];
}

function DeleteOption({ applicationName }: DeleteOptionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem className="text-destructive" onSelect={e => e.preventDefault()}>Delete</DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setIsLoading(true);
              await removeApplication(applicationName, false);
              setIsLoading(false);
              setIsDialogOpen(false);
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
                  "Yes, delete"
                )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
