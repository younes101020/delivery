"use client";

import { Badge } from "@/app/_components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Separator } from "@/app/_components/ui/separator";
import { cn } from "@/app/_lib/utils";

import { useMouse } from "../_hooks/use-mouse";
import { PostgresIcon } from "../../_components/ui/postgres-icon";
import { DatabaseCreateDialog } from "./create-database-dialog";

export function DatabaseCard({
  title,
  circleSize = 400,
}: {
  title: string;
  circleSize?: number;
}) {
  const [mouse, parentRef] = useMouse();

  return (
    <Card>
      <div
        className="group relative overflow-hidden bg-secondary/10 p-2"
        ref={parentRef}
      >
        <div
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 transform-gpu bg-gradient-to-br from-primary via-[#3BC4F2] to-secondary transition-transform duration-500 group-hover:scale-[3]",
            mouse.elementX === null || mouse.elementY === null
              ? "opacity-0"
              : "opacity-100",
          )}
          style={{
            maskImage: `radial-gradient(${
              circleSize / 2
            }px circle at center, white, transparent)`,
            width: `${circleSize}px`,
            height: `${circleSize}px`,
            left: `${mouse.elementX}px`,
            top: `${mouse.elementY}px`,
          }}
        />
        <div className="absolute inset-px bg-secondary/80" />
        <CardHeader className="relative px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <PostgresIcon />
            <p>/</p>
            <CardTitle className="text-xl">
              {title}
            </CardTitle>
          </div>
          <Badge variant="outline" className="w-fit">SGBD</Badge>
          <Separator />
          <CardDescription className="pt-2 line-clamp-5">
            PostgreSQL is a powerful, open source object-relational database system with over 35 years of active development that has earned it a strong reputation for reliability, feature robustness, and performance.
          </CardDescription>
        </CardHeader>

      </div>
      <CardFooter className="flex flex-col gap-2 items-start bg-secondary">
        <Separator />
        <DatabaseCreateDialog triggerText="Create" type="postgres" />
      </CardFooter>

    </Card>
  );
}
