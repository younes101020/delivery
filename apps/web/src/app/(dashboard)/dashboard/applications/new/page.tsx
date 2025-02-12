import { Deployment } from "@/app/_components/deployment";
import { roboto } from "@/app/layout";

export default function NewApplicationPage(props: {
  searchParams?: Promise<{ page: string }>;
}) {
  return (
    <section className="p-5 bg-background/50 border">
      <h1 className={`text-3xl font-bold w-fit mx-5 bg-primary text-primary-foreground px-2 py-1 leading-none tracking-tight ${roboto.className} italic`}>New application</h1>
      <Deployment sp={props.searchParams} />
    </section>
  );
}
