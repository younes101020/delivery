import type { Dispatch, SetStateAction } from "react";

import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { GithubAppForm } from "@/app/(onboarding)/onboarding/_components/github-app-form";

export function AddNewGithubApp() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AddGithubAppButton handleClick={setOpen} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new github app</DialogTitle>
          <DialogDescription>
            This will allow your Delivery instance to access your GitHub repositories.
          </DialogDescription>
        </DialogHeader>
        <GithubAppForm />
      </DialogContent>
    </Dialog>
  );
}

interface AddGithubAppButtonProps {
  handleClick: Dispatch<SetStateAction<boolean>>;
}

function AddGithubAppButton({ handleClick }: AddGithubAppButtonProps) {
  return (
    <div className="text-xs flex flex-col lg:flex-row lg:gap-2">
      <p className="italic text-nowrap lg:self-center">Not yet sync?</p>
      <Button
        onClick={(e) => {
          e.preventDefault();
          handleClick(true);
        }}
        variant="link"
        className="text-xs italic flex justify-start pl-0 py-0"
      >
        add new github app.
      </Button>
    </div>

  );
}
