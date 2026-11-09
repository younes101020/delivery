"use client";

import type { ApiKeyScope } from "@delivery/jobs/types";

import { API_KEY_SCOPES } from "@delivery/jobs/types";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useActionState, useCallback, useEffect, useState } from "react";

import type { ActionState } from "@/app/_lib/form-middleware";

import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/_components/ui/alert-dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Separator } from "@/app/_components/ui/separator";
import { useSettingsDictionary } from "@/app/_ctx/resources-dictionary";
import { toLocalDateString, withToast } from "@/app/_lib/utils";
import { CopyButton } from "@/app/(dashboard)/dashboard/_components/copy-button";

import { createApiKey, revokeApiKey } from "../actions";

interface CreatedApiKey {
  id: number;
  name: string;
  tokenPrefix: string;
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  token: string;
}

interface ApiKey {
  id: number;
  name: string;
  tokenPrefix: string;
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

const scopeLabels: Record<ApiKeyScope, (labels: ReturnType<typeof useSettingsDictionary>["apiKeys"]) => string> = {
  "applications:read": labels => `${labels.read} ${labels.applications}`,
  "applications:write": labels => `${labels.write} ${labels.applications}`,
  "databases:read": labels => `${labels.read} ${labels.databases}`,
  "databases:write": labels => `${labels.write} ${labels.databases}`,
  "deployments:read": labels => `${labels.read} ${labels.deployments}`,
  "deployments:write": labels => `${labels.write} ${labels.deployments}`,
  "envvars:write": labels => `${labels.write} ${labels.envvars}`,
  "githubapps:read": labels => `${labels.read} ${labels.githubapps}`,
  "githubapps:write": labels => `${labels.write} ${labels.githubapps}`,
  "serverconfig:read": labels => `${labels.read} ${labels.serverconfig}`,
  "serverconfig:write": labels => `${labels.write} ${labels.serverconfig}`,
  "version:read": labels => `${labels.read} ${labels.version}`,
  "version:write": labels => `${labels.write} ${labels.version}`,
};

interface ApiKeyManagerProps {
  initialApiKeys: ApiKey[];
}

export function ApiKeyManager({ initialApiKeys }: ApiKeyManagerProps) {
  const settings = useSettingsDictionary();
  const labels = settings.apiKeys;
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [visibleToken, setVisibleToken] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<ActionState & { createdApiKey?: CreatedApiKey }, FormData>(
    withToast(createApiKey),
    { inputs: {} },
  );

  useEffect(() => {
    const createdApiKey = state.createdApiKey;
    if (!createdApiKey)
      return;

    setApiKeys(keys => [createdApiKey, ...keys.filter(key => key.id !== createdApiKey.id)]);
    setVisibleToken(createdApiKey.token);
  }, [state.createdApiKey]);

  const handleRevoked = useCallback((id: number) => {
    setApiKeys(keys => keys.map(key => key.id === id ? { ...key, revokedAt: new Date().toISOString() } : key));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {visibleToken && (
        <Alert variant="success">
          <CheckCircle2 />
          <AlertTitle>{labels.tokenTitle}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{labels.tokenDescription}</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="max-w-full break-all rounded bg-muted p-2 text-xs">{visibleToken}</code>
              <CopyButton value={visibleToken} variant="outline" aria-label={labels.copy} title={labels.copy} className="h-8" />
              <Button type="button" variant="ghost" size="sm" onClick={() => setVisibleToken(null)}>
                {settings.common.cancel}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <section>
        <h2 className="mb-3 text-lg">{labels.createTitle}</h2>
        <Separator className="mb-4" />
        <form className="flex max-w-2xl flex-col gap-4" action={formAction}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="api-key-name">{labels.name}</Label>
            <Input id="api-key-name" name="name" placeholder={labels.namePlaceholder} required maxLength={100} />
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">{labels.scopes}</legend>
            {API_KEY_SCOPES.map(scope => (
              <Label key={scope} className="flex items-center gap-2 font-normal">
                <input type="checkbox" name="scopes" value={scope} className="h-4 w-4 accent-primary" />
                <span>{scopeLabels[scope](labels)}</span>
              </Label>
            ))}
          </fieldset>
          <Button type="submit" className="w-fit" disabled={isPending}>
            {isPending
              ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {labels.creating}
                  </>
                )
              : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    {labels.create}
                  </>
                )}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg">{labels.title}</h2>
        <Separator className="mb-4" />
        {apiKeys.length === 0
          ? <p className="text-sm text-muted-foreground">{labels.empty}</p>
          : (
              <ul className="flex flex-col divide-y">
                {apiKeys.map(apiKey => (
                  <ApiKeyRow
                    key={apiKey.id}
                    apiKey={apiKey}
                    onRevoked={handleRevoked}
                  />
                ))}
              </ul>
            )}
      </section>
    </div>
  );
}

function ApiKeyRow({ apiKey, onRevoked }: { apiKey: ApiKey; onRevoked: (id: number) => void }) {
  const settings = useSettingsDictionary();
  const labels = settings.apiKeys;
  const [state, formAction, isPending] = useActionState<ActionState & { revokedId?: number }, FormData>(
    withToast(revokeApiKey),
    { inputs: {} },
  );

  useEffect(() => {
    if (state.revokedId)
      onRevoked(state.revokedId);
  }, [onRevoked, state.revokedId]);

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <h3 className="font-medium">{apiKey.name}</h3>
        <p className="font-mono text-xs text-muted-foreground">
          {apiKey.tokenPrefix}
          ...
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {labels.scopes}
          :
          {" "}
          {apiKey.scopes.map(scope => scopeLabels[scope](labels)).join(", ")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {labels.created}
          :
          {" "}
          {toLocalDateString(apiKey.createdAt)}
          {" · "}
          {labels.lastUsed}
          :
          {" "}
          {apiKey.lastUsedAt ? toLocalDateString(apiKey.lastUsedAt) : labels.neverUsed}
          {apiKey.revokedAt && (
            <>
              {" · "}
              {labels.revoked}
            </>
          )}
        </p>
      </div>
      {!apiKey.revokedAt && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={isPending}>
              {isPending ? labels.revoking : labels.revoke}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{labels.revokeTitle}</AlertDialogTitle>
              <AlertDialogDescription>{labels.revokeDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{settings.common.cancel}</AlertDialogCancel>
              <AlertDialogAction asChild>
                <form action={formAction}>
                  <input type="hidden" name="id" value={apiKey.id} />
                  <Button type="submit" variant="destructive" disabled={isPending}>
                    {isPending ? labels.revoking : labels.revoke}
                  </Button>
                </form>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
  );
}
