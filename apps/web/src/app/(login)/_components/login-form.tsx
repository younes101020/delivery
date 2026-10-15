import type { AuthDictionary, Locale } from "@delivery/i18n";

import { Login } from "@/app/_components/login-form";
import { Card, CardContent } from "@/app/_components/ui/card";
import { cn } from "@/app/_lib/utils";

import { Cobe } from "../../_components/ui/cobeglobe";

interface LoginFormProps {
  auth: AuthDictionary;
  locale: Locale;
  mode: "signin" | "signup";
}

export function LoginForm({ auth, className, locale, mode }: LoginFormProps & React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden py-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight text-balance">
                  {mode === "signin" ? auth.signinTitle : auth.signupTitle}
                  <span className="text-primary">.</span>
                </h1>
                {mode === "signin"
                  ? (
                      <p className="text-balance text-muted-foreground text-xs">
                        {auth.signinDescription}
                      </p>
                    )
                  : (
                      <p className="text-balance text-muted-foreground text-xs">
                        {auth.signupDescription}
                      </p>
                    )}
              </div>
              <Login auth={auth} locale={locale} mode={mode} />
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
