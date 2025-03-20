import { Plus } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/app/_components/ui/card";

export function NewAppCard() {
  return (
    <Card className="h-full w-full transition-all border-dashed border-primary">
      <Link href="/dashboard/applications/new">
        <CardContent className="flex justify-center items-center h-full">
          <Plus size={40} className="text-primary" strokeWidth={1} />
        </CardContent>
      </Link>
    </Card>
  );
}
