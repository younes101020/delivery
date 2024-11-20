import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STEP_METADATA = [
  {
    title: "Account creation",
    description: "You will use this account to manage your applications.",
  },
  {
    title: "Github App",
    description: "This will give you control over your GitHub repositories.",
  },
  {
    title: "Deploy your app",
    description: "This step should deploy your application over the internet.",
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
    <CardHeader className="flex md:flex-row gap-4 justify-around">
      {STEP_METADATA.map((step, i) => (
        <div key={i} className={`w-56 ${i !== 0 && "opacity-40"}`}>
          <CardTitle className="flex gap-2">
            <div>{step.title}</div>
            {i === 0 && <BounceIndicator />}
          </CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </div>
      ))}
    </CardHeader>
  );
}
