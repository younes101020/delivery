import type { Metadata } from "next";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import localFont from "next/font/local";

import "./globals.css";

import ReactQueryProviders from "@/app/_lib/react-query-provider";
import { env } from "@/env";

import { FetcherProvider } from "./_lib/fetch-provider";
import { getQueryClient } from "./_lib/get-rsc-query-client";
import { getUser } from "./_lib/user-session";
import { getTeamForUser } from "./api/team/queries";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Delivery",
  description: "From Github repository to production ready application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = env.WEB_BASE_URL;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });

  queryClient.prefetchQuery({
    queryKey: ["team"],
    queryFn: getTeamForUser,
  });

  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased absolute inset-0 h-full w-full bg-background/15 bg-[linear-gradient(to_right,rgb(156_163_175/0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgb(156_163_175/0.2)_1px,transparent_1px)] bg-size-[24px_24px]`}
      >
        <FetcherProvider baseUrl={baseUrl}>
          <ReactQueryProviders>
            <HydrationBoundary state={dehydrate(queryClient)}>
              {children}
            </HydrationBoundary>
          </ReactQueryProviders>
        </FetcherProvider>
      </body>
    </html>
  );
}
