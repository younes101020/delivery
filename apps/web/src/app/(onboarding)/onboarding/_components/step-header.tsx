import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useStep } from "./step";

const headerData = [
  {
    title: "Account creation",
    description: "You will use this account to manage your applications.",
  },
  {
    title: "Github App",
    description: "This will allow Delivery to create deployment from your GitHub repositories.",
  },
  {
    title: "Deploy your app",
    description: "This step should deploy your application over the internet.",
  },
];

function Bounce() {
  return (
    <span className="relative flex h-2 w-2 pt-[.25rem]">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
    </span>
  );
}

export function StepsHeader({ className }: { className?: string }) {
  const { currentStep } = useStep();
  return (
    <CardHeader
      className={cn(
        "flex md:flex-row gap-8 md:gap-4 justify-around mt-8",
        className,
      )}
    >
      {headerData.map((step, i) => (
        <div
          key={i}
          className={`w-56 ${i + 1 !== currentStep && "opacity-40"} relative`}
        >
          <CardTitle className="flex gap-2 font-mono">
            <div className="z-20">{step.title}</div>
            {i + 1 === currentStep && <Bounce />}
          </CardTitle>
          <CardDescription className="italic">
            {step.description}
          </CardDescription>
          <div
            className={`
              absolute top-[-2rem] left-[-.8rem] text-muted-foreground font-bold text-6xl opacity-30
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
