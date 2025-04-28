import { roboto } from "@/app/font";

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className={`${roboto.className} bg-primary text-primary-foreground tracking-wide leading-none italic text-3xl font-bold px-2 py-1 w-fit`}>
      {children}
    </h1>
  );
}
