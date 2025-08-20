"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Button } from "@/app/_components/ui/button";
import { Paragraph } from "@/app/_components/ui/paragraph";
import { withToast } from "@/app/_lib/utils";
import { retryDeploy } from "@/app/actions";

import { useGetRepoName } from "../_hooks/use-get-repo-name";

interface RedeployButtonProps {
  jobId: string;
}

export function RedeployButton({ jobId }: RedeployButtonProps) {
  const repoName = useGetRepoName();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    withToast(retryDeploy),
    { error: "", success: "", inputs: { repoName, jobId } },
  );

  return (
    <div className="flex flex-col gap-2">
      {state.error && <Paragraph variant="error">{state.error}</Paragraph>}
      <form>
        <input type="hidden" name="repoName" defaultValue={repoName} />
        <input type="hidden" name="jobId" defaultValue={jobId} />
        <Button
          variant="outline"
          className="w-fit"
          formAction={formAction}
        >
          {isPending
            ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redeployment...
                </>
              )
            : (
                <>
                  <RotateCcw />
                  Retry
                </>
              )}
        </Button>
      </form>
    </div>
  );
}
