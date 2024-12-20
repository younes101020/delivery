import { Header } from "@/components/header";
import { UserProvider } from "@/lib/auth";
import { getUser } from "@/lib/users";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,rgba(188,185,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(188,185,184,0.1)_1px,transparent_1px)] bg-[size:24px_24px]`}
      >
        <Header />
        <Suspense>
          <UserProvider userPromise={userPromise}>{children}</UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
