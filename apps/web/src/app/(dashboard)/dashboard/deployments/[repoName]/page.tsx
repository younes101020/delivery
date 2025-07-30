import { env } from "@/env";

import { Deployment } from "./_components/deployment";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";

export default function SuspensedDeploymentsPage() {
  const baseUrl = env.BASE_URL;
  return (
    <section className="h-full flex justify-center items-center py-4">
      <SubscribeToSSE baseUrl={baseUrl}>
        <Deployment />
      </SubscribeToSSE>
    </section>

  );
}
