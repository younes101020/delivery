"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, Loader2 } from "lucide-react";
import { Suspense, useActionState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";
import type { TeamForUser } from "@/app/api/team/queries";

import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { AlertDialog, AlertDialogTrigger } from "@/app/_components/ui/alert-dialog";
import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useSettingsDictionary } from "@/app/_ctx/resources-dictionary";
import { useUser } from "@/app/_hooks/use-user";
import { useFetch } from "@/app/_lib/fetch-provider";
import { withToast } from "@/app/_lib/utils";
import { CopyButton } from "@/app/(dashboard)/dashboard/_components/copy-button";

import { inviteTeamMember } from "../actions";
import { RevokeTeamMemberForm } from "./revoke-team-member-form";

export function TeamList() {
  const { team: settingsTeam } = useSettingsDictionary();
  return (
    <div className="mt-2">
      <h2>{settingsTeam.members}</h2>
      <Suspense fallback={<PendingTeamList />}>
        <TeamMemberList />
      </Suspense>
    </div>
  );
}

function TeamMemberList() {
  const { team: settingsTeam } = useSettingsDictionary();
  const { fetcher } = useFetch();
  const { data: team } = useSuspenseQuery<TeamForUser>({
    queryKey: ["team"],
    queryFn: () => fetcher("/api/team"),
  });

  if (!team) {
    return <div className="mt-4 flex justify-center">{settingsTeam.noTeam}</div>;
  }

  return (
    <ScrollArea className="my-2 w-full border border-muted">
      <ul className="flex flex-col h-full mt-4 text-sm max-h-80">
        {team.teamMembers
          .sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0))
          .map(member => (
            <li key={member.user.id} className="flex justify-between p-4">
              <div>
                <div>{member.user.email}</div>
                <div className="text-muted-foreground text-xs">
                  <span className="text-primary pr-2">{">"}</span>
                  {member.role}
                </div>
              </div>
              {member.role !== "owner" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      {settingsTeam.revoke}
                    </Button>
                  </AlertDialogTrigger>
                  <RevokeTeamMemberForm memberId={member.id} />
                </AlertDialog>
              )}
            </li>
          ))}
      </ul>
    </ScrollArea>
  );
}

interface TeamFormContentProps {
  email?: string;
  role?: string;
  inviteUrl?: string;
}

export function TeamFormContent() {
  const { common, team } = useSettingsDictionary();
  const { user } = useUser();
  const isOwner = user && user?.role === "owner";
  const [state, formAction, pending] = useActionState<ActionState<TeamFormContentProps>, FormData>(
    withToast(inviteTeamMember),
    {
      error: "",
      success: "",
      inputs: {},
    },
  );
  return (
    <div>
      {state.inputs.inviteUrl! && (
        <>
          <Alert variant="success" className="mt-8">
            <CheckCircle2Icon />
            <AlertTitle>{team.inviteTitle}</AlertTitle>
            <AlertDescription className="text-xs">
              {team.inviteDescription}
              <Separator />
              <div className="flex items-center gap-2 my-2 max-w-full">
                <p className="text-xs">{state.inputs.inviteUrl}</p>
                <CopyButton
                  value={state.inputs.inviteUrl}
                  variant="outline"
                  className="h-5 w-5 text-foreground opacity-100 hover:bg-muted hover:text-foreground [&_svg]:h-3.5 [&_svg]:w-3.5"
                />
              </div>
            </AlertDescription>
          </Alert>
        </>
      )}

      <form className="w-full flex flex-col gap-6 pt-4" action={formAction} aria-label="form">
        <div>
          <Label htmlFor="email">{common.email}</Label>
          <Input
            id="email"
            name="email"
            type="text"
            aria-label="name"
            placeholder="john@doe.com"
            className="rounded-r-none"
            disabled={!isOwner}
            defaultValue={state.inputs?.email}
          />
          <p className="text-muted-foreground text-xs pt-2">
            {team.emailHelp}
          </p>
        </div>
        <div>
          <Label>{team.role}</Label>
          <RadioGroup defaultValue="member" className="mt-2" disabled={!isOwner} name="role">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="member" id="member" />
              <Label htmlFor="member">{team.member}</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="owner" id="owner" />
              <Label htmlFor="owner">{team.owner}</Label>
            </div>
          </RadioGroup>
          <p className="text-muted-foreground text-xs pt-2">
            {team.roleHelp}
          </p>
        </div>

        <CardFooter className="flex px-0 pt-8 col-span-2">
          <Button type="submit" disabled={pending || !isOwner} aria-label="submit" className="w-full">
            {pending
              ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {common.loading}
                  </>
                )
              : (
                  team.getInvitationLink
                )}
          </Button>
        </CardFooter>
      </form>
    </div>

  );
}

function PendingTeamList() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  );
}
