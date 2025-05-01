import type { Metadata } from "next";

import { PublicEnvScript } from "next-runtime-env";
import localFont from "next/font/local";
import { Suspense } from "react";

import { UserProvider } from "./_lib/user-provider";
import "./globals.css";
import { getUser } from "./_lib/user-session";

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
  const userPromise = getUser();
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,rgb(156_163_175_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgb(156_163_175_/_0.1)_1px,transparent_1px)] bg-[size:24px_24px]`}
      >
        <Suspense>
          <UserProvider userPromise={userPromise}>
            {children}
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
