import { cn } from "@/lib/utils";
import Image from "next/image";

export function AceMascot({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src="/images/logo.png"
        alt="AP Ace Logo"
        fill
        style={{ objectFit: 'contain' }}
        sizes="64px"
      />
    </div>
  );
}
