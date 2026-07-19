"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

// The three.js bundle is heavy — load it lazily, client-only, so it never
// affects LCP. The Suspense fallback keeps the hero visually stable.
const HeroScene = dynamic(() => import("@/components/three/hero-scene"), {
  ssr: false,
  loading: () => null,
});

type Mode = "off" | "reduced" | "full";

/**
 * Mounts the 3D scene only when it makes sense:
 * - never under prefers-reduced-motion (static decoration instead)
 * - reduced node count on small screens / coarse pointers
 * - full detail on desktop
 */
export function Hero3D({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("off");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const tablet = window.matchMedia("(min-width: 640px)");

    const compute = () => {
      if (reduceMotion.matches) return setMode("off");
      if (desktop.matches) return setMode("full");
      if (tablet.matches) return setMode("reduced");
      setMode("off");
    };
    compute();

    const queries = [reduceMotion, desktop, tablet];
    queries.forEach((q) => q.addEventListener("change", compute));
    return () => queries.forEach((q) => q.removeEventListener("change", compute));
  }, []);

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {mode === "off" ? (
        // Static fallback: quiet radial glow so the hero still has depth
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(185,153,95,0.16),transparent_65%)]" />
      ) : (
        <Suspense
          fallback={
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(185,153,95,0.16),transparent_65%)]" />
          }
        >
          <HeroScene detail={mode === "full" ? "full" : "reduced"} />
        </Suspense>
      )}
    </div>
  );
}
