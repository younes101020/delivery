import { BoxReveal } from "./_components/box-reveal";
import Ripple from "./_components/ripple";

export default function Deployments() {
  return (
    <div className="h-full flex justify-center items-center py-4">
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
        <BoxReveal duration={0.5}>
          <p className="text-xl font-semibold">
            We clone your GitHub repo to your server<span className="text-primary">.</span>
          </p>
        </BoxReveal>
        <p className="text-xs text-primary">1 / 2</p>
        <Ripple />
      </div>
    </div>
  );
}
