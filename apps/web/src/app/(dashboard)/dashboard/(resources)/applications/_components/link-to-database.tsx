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

interface InjectEnvCardProps {
  containerId: string;
  applications: {
    applicationName: string;
  }[];
}

export function InjectEnvCard({ containerId, applications }: InjectEnvCardProps) {
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
        <Button className="text-xs">Link to application</Button>
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
            <Label htmlFor="applicationName">
              Application target
            </Label>
            <Select name="applicationName">
              <SelectTrigger>
                <SelectValue placeholder="Select a application" defaultValue={state.inputs.name} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Applications</SelectLabel>
                  {applications.map(application => (
                    <SelectItem key={application.applicationName} value={application.applicationName}>
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
              placeholder="ex: DATABASE_URL"
              className="col-span-3"
            />
          </div>
          <input type="hidden" name="containerId" id="containerId" value={containerId} />
          <DialogFooter>
            <Button type="submit" disabled={pending} className="text-xs">
              Inject and redeploy
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
