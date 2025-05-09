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

function isValidTimestampMs(value: any) {
  return !Number.isNaN(Number(value));
}

function isValidDate(date: string | null | Date | number) {
  return !!Date.parse(date as string);
}

export function formatDate(date: string | null | Date | number) {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  const outputDateTemplate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });

  return isValidTimestampMs(date) || isValidDate(date)
    ? outputDateTemplate.format(new Date(isValidTimestampMs(date) ? (Number(date) * 1000) : date as Date))
    : "Invalid Date";
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
