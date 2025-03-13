import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function formatDate(date: string | null | Date | number) {
  if (!date)
    return null;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  return formatter.format(dateObj);
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
