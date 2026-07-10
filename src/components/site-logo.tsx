import Image from "next/image";
import Link from "next/link";

type SiteLogoProps = { compact?: boolean; variant?: "light" | "dark" };

export function SiteLogo({ compact = false, variant = "dark" }: SiteLogoProps) {
  const src = variant === "light" ? "/logo-light.svg" : "/logo-dark.svg";

  return (
    <Link href="/" className="flex items-center gap-4" aria-label="Open Ways">
      <div className="h-12 w-12 flex-shrink-0">
        <Image src={src} alt="Open Ways logo" width={48} height={48} priority />
      </div>
      {!compact ? (
        <div className="leading-tight">
          <p className="text-lg font-semibold tracking-tight text-slate-900">Open Ways</p>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">ייעוץ | משכנתאות | אשראי</p>
        </div>
      ) : null}
    </Link>
  );
}
