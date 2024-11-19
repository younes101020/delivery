import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  weight: ["100", "900"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  weight: ["100", "900"],
  subsets: ["latin"],
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,rgba(188,185,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(188,185,184,0.1)_1px,transparent_1px)] bg-[size:24px_24px]`}
      >
        <header className="bg-black/45 border-primary border-b">
          <Image src="/logo.svg" width={200} height={200} alt="Delivery logo" />
        </header>
        {children}
      </body>
    </html>
  );
}
