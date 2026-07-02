"use client";

import type { InputHTMLAttributes } from "react";

import { SearchIcon } from "lucide-react";

import { Input } from "./ui/input";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
  iconClassName?: string;
}

export function SearchInput({
  className = "w-full border-0",
  iconClassName = "h-4 w-4 mr-2.5",
  ...inputProps
}: SearchInputProps) {
  return (
    <div className={`flex w-full items-center border rounded-lg px-2.5 py-1.5 mb-2 ${className}`.trim()}>
      <SearchIcon className={iconClassName} />
      <Input
        {...inputProps}
        className="w-full border-0"
      />
    </div>
  );
}
