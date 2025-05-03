import { env } from "@/env";

import { Stepper } from "./_components/stepper";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";

export default function SuspensedDeploymentsPage() {
  const baseUrl = env.BASE_URL;
  return (
    <section className="h-full flex justify-center items-center py-4">
      <SubscribeToSSE baseUrl={baseUrl}>
        <Stepper />
      </SubscribeToSSE>
    </section>
  );
}
