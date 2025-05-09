import { Bounce } from "@/app/_components/ui/bounce";
import { CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { cn } from "@/app/_lib/utils";

import { useStep } from "./step";

const headerData = [
  {
    title: "Account creation",
    description: "To manage your applications.",
  },
  {
    title: "URLs",
    description:
      "To expose your applications on the internet.",
  },
  {
    title: "Github App",
    description: "To create deployment from your GitHub repositories.",
  },
  {
    title: "Deploy your app",
    description: "To deploy your application over the internet.",
  },
];

export function StepsHeader({ className }: { className?: string }) {
  const { currentStep } = useStep();
  return (
    <CardHeader className={cn("flex md:flex-row gap-8 md:gap-4 justify-around px-10 mt-5", className)}>
      {headerData.map((step, i) => (
        <div key={i} className={`w-56 ${i + 1 !== currentStep && "opacity-40"} relative`}>
          <CardTitle className="flex gap-2 font-mono">
            <div className="z-20">{step.title}</div>
            {i + 1 === currentStep && <Bounce />}
          </CardTitle>
          <CardDescription className="italic">{step.description}</CardDescription>
          <div
            className={`
              absolute top-[-2rem] left-[-.8rem] text-primary/75 font-bold text-6xl opacity-30
              before:content-[''] 
              before:absolute 
            `}
          >
            {i + 1}
          </div>
        </div>
      ))}
    </CardHeader>
  );
}
