"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

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
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Paragraph } from "@/app/_components/ui/paragraph";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/_components/ui/select";

import { injectEnv } from "../actions";

interface InjectEnvCardProps {
  applicationName: string;
  databases: {
    name: string;
    id: string;
  }[] | null;
}

export function InjectEnvCard({ applicationName, databases }: InjectEnvCardProps) {
  const initialInputs = {
    applicationName,
    databases,
  };

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    injectEnv,
    {
      inputs: initialInputs,
    },
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs">Link to database</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link database to your application</DialogTitle>
          <DialogDescription>
            Your application need a database ? Link it here. We will inject the database URI as an environment variable.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="dbId">
              Database target
            </Label>
            <Select name="dbId">
              <SelectTrigger>
                <SelectValue placeholder="Select a database" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Databases</SelectLabel>
                  {databases && databases.map(database => (
                    <SelectItem key={database.id} value={database.id}>
                      {database.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="env">
              Environment variable name
            </Label>
            <Input
              name="env"
              id="env"
              placeholder="ex: DATABASE_URL"
              className="col-span-3"
            />
          </div>
          <input type="hidden" name="applicationName" id="applicationName" value={applicationName} />
          {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="text-xs">
              Submit
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
