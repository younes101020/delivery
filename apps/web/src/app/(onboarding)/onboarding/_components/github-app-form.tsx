"use client";

import { Info } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { env } from "@/env";

const GITHUB_APP_REGISTRATION_URL = "https://github.com/settings/apps/new";

export function GithubAppForm() {
  const [url, setUrl] = useState(GITHUB_APP_REGISTRATION_URL);
  const [enableOrg, setEnableOrg] = useState(false);
  const [name, setName] = useState("");
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
      default_events: ["pull_request", "push"],
    }),
    [name, baseUrl],
  );

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(`https://github.com/organizations/${value}/settings/apps/new`);
  };

  return (
    <form action={url} method="POST" className="space-y-4" aria-label="form">
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
