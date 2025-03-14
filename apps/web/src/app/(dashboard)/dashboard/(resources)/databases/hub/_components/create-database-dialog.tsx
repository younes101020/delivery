import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";

import type { DatabaseType } from "./types";

import { getVersionsComboboxOptions } from "../_lib/registry-queries";
import { CreateDatabaseForm } from "./create-database-form";

interface DatabaseCreateDialogProps {
  triggerText: string;
  type: DatabaseType;
}

const DEFAULT_DATABASE_VERSION = "latest";

export async function DatabaseCreateDialog({ triggerText, type }: DatabaseCreateDialogProps) {
  const versionsCombobox = await getVersionsComboboxOptions();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create database</DialogTitle>
          <DialogDescription>
            Create new
            {" "}
            {type}
            {" "}
            database. Click create when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <CreateDatabaseForm type={type} version={DEFAULT_DATABASE_VERSION} versionsCombobox={versionsCombobox} />
      </DialogContent>
    </Dialog>
  );
}
