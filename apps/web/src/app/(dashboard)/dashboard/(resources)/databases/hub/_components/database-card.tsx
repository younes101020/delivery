"use client";

import { Badge } from "@/app/_components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Separator } from "@/app/_components/ui/separator";
import { cn } from "@/app/_lib/utils";

import { useMouse } from "../_hooks/use-mouse";
import { MongoIcon } from "../../_components/ui/mongo-icon";
import { PostgresIcon } from "../../_components/ui/postgres-icon";

interface DatabaseCardProps {
  label: string;
  description: string;
  dbType: string;
  colorEffectHexClassUtility: string;
  fillIcon: string;
  circleSize?: number;
  children: React.ReactNode;
}

const IconComponentMap = new Map([["Postgres", PostgresIcon], ["Mongo", MongoIcon]]);

export function DatabaseCard({ label, colorEffectHexClassUtility, fillIcon, description, dbType, circleSize = 400, children }: DatabaseCardProps) {
  const [mouse, parentRef] = useMouse();
  const Icon = IconComponentMap.get(label);

  return (
    <Card>
      <div
        className="group relative overflow-hidden bg-secondary/10 p-2"
        ref={parentRef}
      >
        <div
          className={cn(
            `absolute -translate-x-1/2 -translate-y-1/2 transform-gpu bg-gradient-to-br from-primary to-secondary transition-transform duration-500 group-hover:scale-[3]`,
            mouse.elementX === null || mouse.elementY === null
              ? "opacity-0"
              : "opacity-100",
            colorEffectHexClassUtility,
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
            {Icon && <Icon className={fillIcon} />}
            <p className="font-light">/</p>
            <CardTitle className="text-xl font-light">
              {label}
            </CardTitle>
          </div>
          <Badge variant="outline" className="w-fit">{dbType}</Badge>
          <Separator />
          <CardDescription className="pt-2 line-clamp-5">
            {description}
          </CardDescription>
        </CardHeader>

      </div>
      <CardFooter className="flex flex-col gap-2 items-start bg-secondary">
        <Separator />
        {children}
      </CardFooter>

    </Card>
  );
}
