"use client";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ActionState } from "@/lib/auth/middleware";
import { Github, Info, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { githubBatching } from "../actions";

export function GithubAppForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(githubBatching, {
    error: "",
  });

  return (
    <form className="space-y-6" action={formAction}>
      <div>
        <Label htmlFor="name" className="block text-sm font-medium">
          Github App name
        </Label>
        <div className="mt-1">
          <Input
            id="name"
            name="name"
            type="text"
            required
            maxLength={50}
            className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
            placeholder="MySuperGithubApp"
          />
        </div>
        <p className="text-muted-foreground text-xs pt-1">Enter a name for your Github App</p>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="organization" name="organization" />
        <Label htmlFor="organization">Organization</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={15} className="mb-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Are your projects in a Githun organization account?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {state?.error && <div className="text-destructive text-sm">{state.error}</div>}

      <CardFooter className="flex px-0 pt-8 justify-end">
        <Button type="submit" disabled={pending} className="text-wrap">
          {pending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              | Loading...
            </>
          ) : (
            <><Github /> | Start</>
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
