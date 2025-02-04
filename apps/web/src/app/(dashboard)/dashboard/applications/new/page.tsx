import { Deployment } from "@/app/_components/deployment";

export default function NewApplicationPage(props: {
  searchParams?: Promise<{ page: number }>;
}) {
  return (
    <section className="p-5 bg-background/50 border">
      <h1 className="text-3xl font-bold bg-primary text-primary-foreground px-2 py-1 w-fit mx-5">New application</h1>
      <Deployment paginationPromise={props.searchParams} />
    </section>
  );
}
