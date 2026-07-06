import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";

import Sidebar from "./_components/sidebar";
import FlowCanvasWrapper from "./_components/flow-canvas";

export default function ForgePage() {
  return (
    <section className="p-5 bg-background/50 border h-[90%] overflow-hidden">
      <div className="flex justify-between gap-2">
        <div>
          <PageTitle>Forge</PageTitle>
          <PageDescription>Visual stack builder, drag-and-drop canvas for designing your infrastructure</PageDescription>
        </div>

      </div>

      <div className="mt-4 h-full flex ">
        <div className="flex-3 border-r">
          <FlowCanvasWrapper />
        </div>
        <div className="flex-2 mx-2">
          <Sidebar />
        </div>
      </div>
    </section>
  );
}
