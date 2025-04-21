import { Stepper } from "./_components/stepper";
import { SubscribeToSSE } from "./_components/subscribe-to-sse";

export default function SuspensedDeploymentsPage() {
  return (
    <section className="h-full flex justify-center items-center py-4">
      <SubscribeToSSE>
        <Stepper />
      </SubscribeToSSE>
    </section>
  );
}
