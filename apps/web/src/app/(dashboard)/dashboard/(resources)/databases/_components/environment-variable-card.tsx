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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/_components/ui/select";

import { injectEnv } from "../actions";

interface EnvironmentVariableCardProps {
  containerId: string;
  applications: {
    applicationId: number;
    applicationName: string;
  }[];
}

export function EnvironmentVariableCard({ containerId, applications }: EnvironmentVariableCardProps) {
  const initialInputs = {
    containerId,
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
        <Button variant="outline" className="text-xs">Link to application</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link database to your application</DialogTitle>
          <DialogDescription>
            Your application need a database ? Link it here. We will inject the database URI as an environment variable.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="name">
              Application target
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a application" defaultValue={state.inputs.name} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Applications</SelectLabel>
                  {applications.map(application => (
                    <SelectItem key={application.applicationId} value={application.applicationName}>
                      {application.applicationName}
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
              placeholder="ex: DATABASE_URI"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="text-xs">
              Start
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
