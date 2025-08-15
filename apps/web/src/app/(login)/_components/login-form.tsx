import { Login } from "@/app/_components/login-form";
import { Card, CardContent } from "@/app/_components/ui/card";
import { cn } from "@/app/_lib/utils";

import { Cobe } from "../../_components/ui/cobeglobe";

interface LoginFormProps {
  mode: "signin" | "signup";
}

export function LoginForm({ className, mode }: LoginFormProps & React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight text-balance">
                  Welcome
                  {mode === "signin" && ",back"}
                  <span className="text-primary">.</span>
                </h1>
                {mode === "signin"
                  ? (
                      <p className="text-balance text-muted-foreground text-xs">
                        Login to your Delivery account
                        {" "}
                        <span className="">.</span>
                      </p>
                    )
                  : (
                      <p className="text-balance text-muted-foreground text-xs">
                        Create your delivery account
                      </p>
                    )}
              </div>
              <Login mode={mode} />
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
