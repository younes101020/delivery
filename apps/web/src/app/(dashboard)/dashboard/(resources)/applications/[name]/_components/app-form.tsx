"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";

import { editApplication } from "../../actions";

interface AppFormProps {
  name: string;
  fqdn?: string | undefined;
  port?: number | undefined;
  environmentVariables?: string;
}

export function AppForm(applicationData: AppFormProps) {
  const [state, formAction, pending] = useActionState<ActionState<AppFormProps>, FormData>(
    editApplication,
    {
      error: "",
      success: "",
      inputs: {
        name: applicationData.name,
        fqdn: applicationData.fqdn,
        port: applicationData.port,
        environmentVariables: applicationData.environmentVariables,
      },
    },
  );

  return (
    <form className="w-full flex flex-col gap-4 pt-4" action={formAction} aria-label="form">
      <div>
        <Label htmlFor="fqdn">Domain name</Label>
        <Input
          id="fqdn"
          name="fqdn"
          type="text"
          aria-label="name"
          placeholder="mysuperapp"
          className="rounded-r-none"
          defaultValue={state.inputs?.fqdn}
        />
      </div>
      <div>
        <Label htmlFor="port">Port</Label>
        <Input
          id="port"
          name="port"
          type="text"
          placeholder="eg: 3000"
          aria-label="port"
          required
          defaultValue={state.inputs?.port}
        />
      </div>
      <div>
        <Label htmlFor="environmentVariables">Environment variables</Label>
        <Textarea
          id="environmentVariables"
          name="environmentVariables"
          placeholder="eg: NODE_ENV=PRODUCTION"
          aria-label="environmentVariables"
          defaultValue={state.inputs?.environmentVariables}
          className=" min-h-36"
        />
      </div>
      <input type="hidden" name="name" id="name" defaultValue={state.inputs?.name} />

      {state?.error && <div className="text-destructive text-sm">{state.error}</div>}

      <CardFooter className="flex px-0 pt-8 col-span-2">
        <Button type="submit" disabled={pending} aria-label="submit" className="w-full">
          {pending
            ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              )
            : (
                "Save"
              )}
        </Button>
      </CardFooter>
    </form>
  );
}
