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
  fillIcon: string;
  circleSize?: number;
  children: React.ReactNode;
}

const IconComponentMap = new Map([["Postgres", PostgresIcon], ["Mongo", MongoIcon]]);

export function DatabaseCard({ label, fillIcon, description, dbType, children }: DatabaseCardProps) {
  const Icon = IconComponentMap.get(label);
  const { user } = useUser();

  return (
    <Card className="relative">
      <Badge className="w-fit absolute top-0 right-0">{dbType}</Badge>
      <div
        className="group relative overflow-hidden p-2"
      >
        <div />
        <div className="absolute inset-px" />
        <CardHeader className="relative px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className={fillIcon} />}
            <Separator orientation="vertical" className="h-[1.5rem]" />
            <CardTitle className="text-xl font-light">
              {label}
            </CardTitle>
          </div>
          <Separator />
          <CardDescription className="pt-2 line-clamp-5">
            {description}
          </CardDescription>
        </CardHeader>

      </div>
      <CardFooter className="flex flex-col gap-2 items-start">
        <Separator />
        {children}
      </CardFooter>

    </Card>
  );
}
