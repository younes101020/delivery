import { publicEnv } from "@/env";
import { Stepper } from "./_components/stepper";

export default async function Deployments({ params }: { params: Promise<{ event: string }> }) {
  const queueName = (await params).event;
  return (
    <div className="h-full flex justify-center items-center py-4">
      <Stepper queueName={queueName} baseUrl={publicEnv.NEXT_PUBLIC_BASEURL} />
    </div>
  );
}
