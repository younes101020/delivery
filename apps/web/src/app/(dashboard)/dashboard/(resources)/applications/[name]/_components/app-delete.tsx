"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";

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
import { Skeleton } from "@/app/_components/ui/skeleton";

import { removeApplication } from "../../actions";

export function ApplicationDelete() {
  return (
    <Suspense fallback={<PendingApplicationConfigurationButton />}>
      <ApplicationDeleteForm />
    </Suspense>
  );
}

function ApplicationDeleteForm() {
  const { name } = useParams<{ name: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            application.
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
              await removeApplication(name, true);
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

function PendingApplicationConfigurationButton() {
  return <Skeleton className="h-10 w-32" />;
}
