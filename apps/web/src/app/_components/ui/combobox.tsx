"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/app/_lib/utils";

const Combobox = ComboboxPrimitive.Root;

const ComboboxValue = ComboboxPrimitive.Value;

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    className={cn(
      "h-9 w-full min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ComboboxInput.displayName = "ComboboxInput";

const ComboboxChips = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Chips>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Chips>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Chips
    ref={ref}
    className={cn("flex min-h-9 w-full items-center gap-1 overflow-hidden", className)}
    {...props}
  />
));
ComboboxChips.displayName = "ComboboxChips";

const ComboboxChip = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Chip>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Chip>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Chip
    ref={ref}
    className={cn("flex items-center gap-1 rounded-sm bg-secondary px-2 py-1 text-xs", className)}
    {...props}
  >
    {children}
    <ComboboxPrimitive.ChipRemove
      className="rounded-sm opacity-60 hover:opacity-100"
      aria-label={`Remove ${children}`}
    >
      <X className="h-3 w-3" />
    </ComboboxPrimitive.ChipRemove>
  </ComboboxPrimitive.Chip>
));
ComboboxChip.displayName = "ComboboxChip";

const ComboboxChipsInput = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    className={cn("min-w-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground", className)}
    {...props}
  />
));
ComboboxChipsInput.displayName = "ComboboxChipsInput";

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Popup>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Portal>
    <ComboboxPrimitive.Positioner sideOffset={4}>
      <ComboboxPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 min-w-[var(--anchor-width)] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          className,
        )}
        {...props}
      />
    </ComboboxPrimitive.Positioner>
  </ComboboxPrimitive.Portal>
));
ComboboxContent.displayName = "ComboboxContent";

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.List>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.List ref={ref} className={cn("max-h-60 overflow-y-auto", className)} {...props} />
));
ComboboxList.displayName = "ComboboxList";

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Empty ref={ref} className={cn("px-2 py-1.5 text-sm text-muted-foreground", className)} {...props} />
));
ComboboxEmpty.displayName = "ComboboxEmpty";

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
      className,
    )}
    {...props}
  >
    {children}
    <ComboboxPrimitive.ItemIndicator className="absolute right-2 flex h-4 w-4 items-center justify-center">
      <Check className="h-4 w-4" />
    </ComboboxPrimitive.ItemIndicator>
  </ComboboxPrimitive.Item>
));
ComboboxItem.displayName = "ComboboxItem";

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
};
