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
import { useSettingsDictionary } from "@/app/_ctx/resources-dictionary";
import { withToast } from "@/app/_lib/utils";

import { revokeTeamMember } from "../actions";

interface RevvokeTeamMemberFormProps {
  memberId: number;
}

export function RevokeTeamMemberForm({ memberId }: RevvokeTeamMemberFormProps) {
  const { common, team } = useSettingsDictionary();
  const [_, revokeAction, isRevokingPending] = useActionState<ActionState, FormData>(
    withToast(revokeTeamMember),
    {
      inputs: {},
    },
  );

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{team.revokeTitle}</AlertDialogTitle>
        <AlertDialogDescription>
          {team.revokeDescription}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{common.cancel}</AlertDialogCancel>
        <AlertDialogAction asChild>
          <form action={revokeAction}>
            <input type="hidden" name="memberId" value={memberId} />
            <Button
              type="submit"
              className="bg-transparent hover:bg-transparent"
              size="sm"
              disabled={isRevokingPending}
            >
              {isRevokingPending ? common.removing : common.remove}
            </Button>
          </form>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>

  );
}
