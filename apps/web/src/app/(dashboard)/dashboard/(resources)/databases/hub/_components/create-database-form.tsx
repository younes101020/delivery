import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/_components/ui/command";
import { Label } from "@/app/_components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { cn } from "@/app/_lib/utils";

import type { DatabaseType, DatabaseVersionsCombobox } from "./types";

import { createContainer } from "../actions";

interface CreateDatabaseFormProps {
  type: DatabaseType;
  version: string;
  versionsCombobox: DatabaseVersionsCombobox;
}

export function CreateDatabaseForm({ type, version, versionsCombobox }: CreateDatabaseFormProps) {
  const initialInputs = {
    type,
    version,
  };

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createContainer,
    {
      inputs: initialInputs,
    },
  );

  return (
    <form className="w-full flex flex-col gap-4 pt-4" action={formAction}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="version">
          Version
        </Label>
        <DatabaseVersionCombobox value={state.inputs.version} isLoading={pending} versionsCombobox={versionsCombobox} />
        <p className="text-muted-foreground text-xs">
          The version of the database image to use.
        </p>
      </div>
      <input type="hidden" name="type" value={type} />
      <Button type="submit" disabled={pending} aria-label="submit" className="mt-2">
        {pending
          ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            )
          : (
              "Create"
            )}
      </Button>
    </form>
  );
}

interface DatabaseVersionComboboxProps {
  value: string;
  isLoading?: boolean;
  versionsCombobox: DatabaseVersionsCombobox;
}

function DatabaseVersionCombobox({ value, isLoading, versionsCombobox }: DatabaseVersionComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput disabled={isLoading} name="version" placeholder="Search version..." />
          <CommandList>
            <CommandEmpty>No version found.</CommandEmpty>
            <CommandGroup>
              {versionsCombobox.map(v => (
                <CommandItem
                  key={v.value}
                  value={v.value}
                  onSelect={() => {
                    setOpen(false);
                  }}
                >
                  {v.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === v.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
