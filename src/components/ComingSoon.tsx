import { AceMascot } from "@/components/AceMascot";

export function ComingSoon({ pageName }: { pageName: string }) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-20 text-center">
      <AceMascot className="mx-auto h-24 w-24" />
      <h1 className="mt-4 text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
        {pageName} Page Coming Soon!
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
        We're working hard to bring you this feature. Check back soon for updates.
      </p>
    </div>
  );
}
