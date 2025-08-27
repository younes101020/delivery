import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import type { ActionState } from "./form-middleware";

import { getQueryClient } from "./react-query-provider";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseSetCookie(header: string) {
  const pairs = header.split(";");
  const parsed: Record<string, string> = {};

  pairs.forEach((pair) => {
    const [key, value] = pair.trim().split("=");
    parsed[key.toLowerCase()] = value || "true";
  });

  return parsed;
}

export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

export function toLocalDateString(utc: string | number) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(utc));
}

async function get(url: string, input: Record<string, string>) {
  return fetch(
    `${url}?${new URLSearchParams(input).toString()}`,
  );
}

async function post(url: string, input: Record<string, string>) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

type CreateAPIMethod = <
  TInput extends Record<string, string>,
  TOutput,
>(opts: {
  url: string;
  method: "GET" | "POST";
}
) => (input: TInput) => Promise<TOutput>;

export const createAPIMethod: CreateAPIMethod
  = opts => (input) => {
    const method = opts.method === "GET" ? get : post;

    return (
      method(opts.url, input)
        .then(res => res.json())
        .catch(error => ({ error: `API call failed: ${error}` }))
    );
  };

export function withInvalidation<Args extends unknown[], T extends ActionState>(fn: (...args: Args) => Promise<T>, queryKey: string[]) {
  return async (...args: Args) => {
    const queryClient = getQueryClient();
    const promise = fn(...args);

    queryClient.invalidateQueries({ queryKey });

    promise.then((result) => {
      if (result.success) {
        toast.success(result.success);
      }
      else if (result.error) {
        toast.error(result.error);
      }
    });

    return promise;
  };
}

export function withToast<Args extends unknown[], T extends ActionState>(fn: (...args: Args) => Promise<T>) {
  return async (...args: Args) => {
    const promise = fn(...args);

    promise.then((result) => {
      if (result.success) {
        toast.success(result.success);
      }
      else if (result.error) {
        toast.error(result.error);
      }
    });

    return promise;
  };
}
