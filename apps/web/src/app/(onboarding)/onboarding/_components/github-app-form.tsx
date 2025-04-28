"use client";

import { Info } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { CardFooter } from "@/app/_components/ui/card";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Switch } from "@/app/_components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip";
import { WEBHOOK_EVENTS } from "@/app/_lib/github/config";
import { env } from "@/env";

const GITHUB_APP_REGISTRATION_URL = "https://github.com/settings/apps/new";

export function GithubAppForm() {
  const [url, setUrl] = useState(GITHUB_APP_REGISTRATION_URL);
  const [enableOrg, setEnableOrg] = useState(false);
  const [name, setName] = useState("");
  const [selectedEvents, setSelectedEvents] = useState(["pull_request", "push"]);
  const baseUrl = env.NEXT_PUBLIC_BASEURL;

  const data = useMemo(
    () => ({
      name,
      url: baseUrl,
      hook_attributes: {
        url: `${baseUrl}/api/webhooks/github/events`,
        active: true,
      },
      redirect_url: `${baseUrl}/api/webhooks/github/register`,
      callback_urls: [`${baseUrl}/api/webhooks/github/install`],
      setup_url: `${baseUrl}/api/webhooks/github/install`,
      request_oauth_on_install: false,
      default_permissions: {
        contents: "read",
        metadata: "read",
        emails: "read",
        administration: "write",
        pull_requests: "write",
      },
      default_events: selectedEvents,
    }),
    [name, baseUrl, selectedEvents],
  );

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(`https://github.com/organizations/${value}/settings/apps/new`);
  };

  const handleWebhookEventCheckboxChange = (optionId: string) => {
    setSelectedEvents(prev => (prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]));
  };

  return (
    <form action={url} method="POST" className="space-y-8" aria-label="form">
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
            minLength={3}
            maxLength={50}
            value={name}
            onChange={e => setName(e.target.value)}
            className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
            placeholder="MySuperGithubApp"
          />
        </div>
        <p className="text-muted-foreground text-xs pt-1">Enter a name for your Github App</p>
      </div>
      <div>
        <Label htmlFor="events" className="block text-sm font-medium">
          Redeploy when
        </Label>
        <ScrollArea className="my-2 w-full h-40">
          <div className="flex flex-col gap-2">
            {WEBHOOK_EVENTS.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedEvents.includes(option.id)}
                  onCheckedChange={() => handleWebhookEventCheckboxChange(option.id)}
                />
                <Label
                  htmlFor={option.id}
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

        </ScrollArea>

        <p className="text-muted-foreground text-xs pt-1">What events should trigger a redeployment?</p>
      </div>
      <div className={enableOrg ? "" : "opacity-25"}>
        <Label htmlFor="organization" className="block text-sm font-medium">
          Organization name
        </Label>
        <div className="mt-1">
          <Input
            id="organization"
            name="organization"
            type="text"
            disabled={!enableOrg}
            required={enableOrg}
            onChange={handleOrgNameChange}
            maxLength={50}
            className="appearance-none relative block w-full px-3 py-2 border focus:z-10 sm:text-sm"
            placeholder="Facebook"
          />
        </div>
        <p className="text-muted-foreground text-xs pt-1">
          Enter the name of your Github organization
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="organization-bool"
          name="organization-bool"
          checked={enableOrg}
          onCheckedChange={setEnableOrg}
        />
        <Label htmlFor="organization-bool">Organization account?</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={15} className="mb-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Are your repositories in a Github organization account?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <input
        type="hidden"
        id="manifest"
        name="manifest"
        aria-label="manifest"
        value={JSON.stringify(data)}
      />

      <CardFooter className="flex px-0 pt-8 justify-end">
        <Button type="submit">Create & install Github App</Button>
      </CardFooter>
    </form>
  );
}
