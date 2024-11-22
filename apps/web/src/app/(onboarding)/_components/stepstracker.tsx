import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STEP_METADATA = [
  {
    title: "Account creation",
    description: "You will use this account to manage your applications.",
    level: "1",
  },
  {
    title: "Github App",
    description: "This will give you control over your GitHub repositories.",
    level: "2",
  },
  {
    title: "Deploy your app",
    description: "This step should deploy your application over the internet.",
    level: "3",
  },
];

function BounceIndicator() {
  return (
    <span className="relative flex h-2 w-2 pt-[.25rem]">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
    </span>
  );
}

export function StepTracker() {
  return (
    <CardHeader className="flex md:flex-row gap-8 md:gap-4 justify-around mt-8">
      {STEP_METADATA.map((step, i) => (
        <div key={i} className={`w-56 ${i !== 0 && "opacity-40"} relative`}>
          <CardTitle className="flex gap-2">
            <div>{step.title}</div>
            {i === 0 && <BounceIndicator />}
          </CardTitle>
          <CardDescription>{step.description}</CardDescription>
          <div
            className={`
              absolute top-[-1.5rem] left-[-1rem] text-muted-foreground font-bold text-4xl -z-10
              before:content-[''] 
              before:absolute 
              before:top-0
              before:left-0 
              before:w-4 
            `}
          >
            {step.level}
          </div>
        </div>
      ))}
    </CardHeader>
  );
}
