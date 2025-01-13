"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeApplication } from "../../actions";

interface DeleteAppProps {
  id: string;
}

export default function DeleteAppForm({ id }: DeleteAppProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the application.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const { success } = await removeApplication(id);
              if (success) router.push("/dashboard/applications");
            }}
          >
            Yes, delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
