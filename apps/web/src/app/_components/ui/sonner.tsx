"use client";

import type { ToasterProps } from "sonner";

import { Toaster as Sonner } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="group"
      toastOptions={{
        classNames: {
          toast: "!shadow-none !rounded-none",
          success: "!border-green-500 !bg-green-50",
          error: "!border-red-500 !bg-red-50",
          actionButton: "!rounded-none",
          cancelButton: "!rounded-none",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
