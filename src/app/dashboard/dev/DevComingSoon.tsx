
import { Wrench } from "lucide-react";

export function DevComingSoon({ pageName }: { pageName: string }) {
  return (
    <div className="container mx-auto px-4 md:px-6 py-20 text-center">
      <Wrench className="mx-auto h-24 w-24 text-primary" />
      <h1 className="mt-4 text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
        {pageName}
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
        This developer tool is under construction. Check back soon for updates.
      </p>
    </div>
  );
}
