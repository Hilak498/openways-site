"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogoMark } from "@/components/logo";

/**
 * Animated logo for the hero.
 *
 * Layering strategy (keeps LCP fast and degrades gracefully):
 * 1. A static logo lockup renders immediately — this is the LCP element.
 * 2. The <video> is created only after the section is near the viewport
 *    (IntersectionObserver) and only when the user does NOT prefer reduced
 *    motion. It starts with preload="none" + poster, so only the poster
 *    image is fetched up front.
 * 3. When the video can actually play, it fades in above the static logo.
 *    If the files are missing or the codec is unsupported, the static logo
 *    simply stays — no broken UI.
 *
 * Sources (see README for the exact ffmpeg commands):
 * - /video/logo-animation.mov   HEVC with alpha (Safari)
 * - /video/logo-animation.webm  VP9 with alpha (Chrome/Firefox/Edge)
 * - /video/logo-poster.png      first/last frame poster
 */
export function LogoVideo({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;
    // A failing <source> fires "error" on the source element, not the video
    const sources = video.querySelectorAll("source");
    const lastSource = sources[sources.length - 1];
    const onSourceError = () => setFailed(true);
    lastSource?.addEventListener("error", onSourceError);
    video.load();
    const tryPlay = () => {
      video.play().catch(() => {
        /* Autoplay blocked — poster/static logo remains visible. */
      });
    };
    const onCanPlay = () => {
      setReady(true);
      tryPlay();
    };
    if (video.readyState >= 3) {
      onCanPlay();
    } else {
      video.addEventListener("canplay", onCanPlay, { once: true });
    }
    return () => {
      video.removeEventListener("canplay", onCanPlay);
      lastSource?.removeEventListener("error", onSourceError);
    };
  }, [shouldLoad]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
    >
      {/* Static logo — always present; the LCP element and reduced-motion fallback */}
      <div
        className={`flex flex-col items-center gap-6 transition-opacity duration-700 ${
          ready && !failed ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={ready && !failed}
      >
        <LogoMark variant="light-text" className="h-32 w-auto sm:h-40" />
        <Image
          src="/logo-dark-bg.png"
          alt=""
          width={1066}
          height={302}
          className="h-10 w-auto sm:h-12"
        />
      </div>

      {shouldLoad && !failed ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/video/logo-poster.png"
          aria-hidden="true"
          tabIndex={-1}
          onError={() => setFailed(true)}
        >
          {/* Safari — HEVC with alpha channel */}
          <source src="/video/logo-animation.mov" type='video/mp4; codecs="hvc1"' />
          {/* Chrome / Firefox / Edge — VP9 with alpha channel */}
          <source src="/video/logo-animation.webm" type="video/webm" />
        </video>
      ) : null}
    </div>
  );
}
