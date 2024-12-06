import { UserProvider } from "@/lib/auth";
import { getUser } from "@/lib/users";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
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
        className={`${geistSans.className} ${geistMono.className} antialiased absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,rgba(188,185,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(188,185,184,0.1)_1px,transparent_1px)] bg-[size:24px_24px]`}
      >
        <header className="bg-black/45 border-primary border-b h-[5vh] flex justify-center">
          <Image
            src="/logo.svg"
            width={200}
            height={200}
            alt="Delivery logo"
            className="border border-primary border-y-0 rounded-full"
          />
        </header>
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
      </body>
    </html>
  );
}
