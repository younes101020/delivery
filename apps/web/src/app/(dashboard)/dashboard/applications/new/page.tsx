import { Deployment } from "@/app/_components/deployment";

export default function NewApplicationPage(props: {
  searchParams?: Promise<{ page: string }>;
}) {
  return (
    <section className="p-5 bg-background/50 border">
      <h1 className="text-3xl font-bold px-2 py-1 w-fit mx-5 tracking-wide">New application</h1>
      <Deployment sp={props.searchParams} />
    </section>
  );
}
