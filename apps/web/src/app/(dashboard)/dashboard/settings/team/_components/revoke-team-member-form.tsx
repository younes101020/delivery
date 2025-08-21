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
import { withToast } from "@/app/_lib/utils";

import { revokeTeamMember } from "../actions";

interface RevvokeTeamMemberFormProps {
  memberId: number;
}

export function RevokeTeamMemberForm({ memberId }: RevvokeTeamMemberFormProps) {
  const [_, revokeAction, isRevokingPending] = useActionState<ActionState, FormData>(
    withToast(revokeTeamMember),
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
