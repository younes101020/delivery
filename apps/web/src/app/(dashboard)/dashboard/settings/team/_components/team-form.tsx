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
import { Paragraph } from "@/app/_components/ui/paragraph";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Separator } from "@/app/_components/ui/separator";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useUser } from "@/app/_hooks/use-user";
import { useFetch } from "@/app/_lib/fetch-provider";
import { withToast } from "@/app/_lib/utils";
import { CopyButton } from "@/app/(dashboard)/dashboard/_components/copy-button";

import { inviteTeamMember } from "../actions";
import { RevokeTeamMemberForm } from "./revoke-team-member-form";

export function TeamList() {
  return (
    <div className="mt-2">
      <h2>Team Members</h2>
      <Suspense fallback={<PendingTeamList />}>
        <TeamMemberList />
      </Suspense>
    </div>
  );
}

function TeamMemberList() {
  const { fetcher } = useFetch();
  const { data: team } = useSuspenseQuery<TeamForUser>({
    queryKey: ["team"],
    queryFn: () => fetcher("/api/team"),
  });

  if (!team) {
    return <div className="mt-4 flex justify-center">No team</div>;
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
                      Revoke
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
  const { user } = useUser();
  const isOwner = user?.role === "owner";
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
            <AlertTitle>Share your invitation link</AlertTitle>
            <AlertDescription className="text-xs">
              Your invitation URL has been successfully generated. Share this link with the member you wish to invite to the team.
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
          <Label htmlFor="email">Email</Label>
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
            The email address of the user you want to invite to your team.
          </p>
        </div>
        <div>
          <Label>Role</Label>
          <RadioGroup defaultValue="member" className="mt-2" disabled={!isOwner} name="role">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="member" id="member" />
              <Label htmlFor="member">Member</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="owner" id="owner" />
              <Label htmlFor="owner">Owner</Label>
            </div>
          </RadioGroup>
          <p className="text-muted-foreground text-xs pt-2">
            The role of the user you want to invite to your team. Members can access the team, while owners have full control over it.
          </p>
        </div>
        {state?.error && <Paragraph variant="error">{state.error}</Paragraph>}
        {state?.success && <Paragraph variant="success">{state.success}</Paragraph>}

        <CardFooter className="flex px-0 pt-8 col-span-2">
          <Button type="submit" disabled={pending || !isOwner} aria-label="submit" className="w-full">
            {pending
              ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                )
              : (
                  "Get invitation link"
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
