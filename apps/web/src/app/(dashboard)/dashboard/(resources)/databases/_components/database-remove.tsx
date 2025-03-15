"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";

import { removeContainer } from "../actions";

interface DeleteAppProps {
  containerId: string;
}

export function DeleteDatabaseForm({ containerId }: DeleteAppProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button className="w-full absolute after:absolute after:flex after:justify-center after:items-center after:top-0 after:right-0 after:h-5 after:w-20 after:bg-destructive after:text-destructive-foreground after:text-xs after:font-normal after:content-['delete']"></button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              await removeContainer(containerId);
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
