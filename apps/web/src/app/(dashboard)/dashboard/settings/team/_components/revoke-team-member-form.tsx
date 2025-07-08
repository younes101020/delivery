"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { Button } from "@/app/_components/ui/button";
import { Paragraph } from "@/app/_components/ui/paragraph";

import { revokeTeamMember } from "../actions";

interface RevvokeTeamMemberFormProps {
  memberId: number;
}

export function RevokeTeamMemberForm({ memberId }: RevvokeTeamMemberFormProps) {
  const [state, revokeAction, isRevokingPending] = useActionState<ActionState, FormData>(
    revokeTeamMember,
    {
      inputs: {},
    },
  );

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently revoke this team member access to your team and all its resources.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}
        {state?.success && <Paragraph variant="success">{state.success}</Paragraph>}
        <AlertDialogAction asChild>
          <form action={revokeAction}>
            <input type="hidden" name="memberId" value={memberId} />
            <Button
              type="submit"
              className="bg-transparent hover:bg-transparent"
              size="sm"
              disabled={isRevokingPending}
            >
              {isRevokingPending ? "Removing..." : "Remove"}
            </Button>
          </form>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>

  );
}
