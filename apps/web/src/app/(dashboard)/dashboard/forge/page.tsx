import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

import FlowCanvasWrapper from "./_components/flow-canvas";
import Sidebar from "./_components/sidebar";

export default function ForgePage() {
  return (
    <section className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden border bg-background/50 p-5">
      <div className="flex justify-between gap-2">
        <div>
          <PageTitle>Forge</PageTitle>
          <PageDescription>Visual stack builder, drag-and-drop canvas for designing your infrastructure</PageDescription>
        </div>

      </div>

      <div className="mt-4 flex min-h-0 flex-1">
        <div className="min-w-0 flex-3 border-r">
          <FlowCanvasWrapper />
        </div>
        <div className="mx-2 min-w-0 flex-2">
          <Sidebar />
        </div>
      </div>
    </section>
  );
}
