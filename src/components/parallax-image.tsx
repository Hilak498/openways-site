"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { FC } from "react";

type ParallaxImageProps = {
  src: string;
  alt?: string;
  className?: string;
  intensity?: number; // px max
};

export const ParallaxImage: FC<ParallaxImageProps> = ({ src, alt = "", className = "", intensity = 12 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 20 });
  const sy = useSpring(y, { stiffness: 120, damping: 20 });

  function onPointerMove(e: React.PointerEvent) {
    const root = (e.currentTarget as HTMLElement);
    const rect = root.getBoundingClientRect();
    const px = (e.clientX - (rect.left + rect.width / 2)) / rect.width; // -0.5..0.5
    const py = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    x.set(px * intensity);
    y.set(py * intensity);
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className={`parallax-root ${className}`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <motion.div style={{ x: sx, y: sy }} className="will-change-transform">
        <img src={src} alt={alt} width={560} height={360} className="select-none" draggable="false" />
      </motion.div>
    </div>
  );
};
