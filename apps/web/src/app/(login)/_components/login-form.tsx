import { Login } from "@/app/_components/login-form";
import { Card, CardContent } from "@/app/_components/ui/card";
import { cn } from "@/app/_lib/utils";

import { Cobe } from "../../_components/ui/cobeglobe";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your
                  {" "}
                  <span className="underline underline-offset-2 italic">Delivery</span>
                  {" "}
                  account
                </p>
              </div>
              <Login mode="signin" />
            </div>
          </div>
          <div className="relative hidden bg-background md:block">
            <Cobe />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
