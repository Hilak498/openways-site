"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type VariantName = "fadeUp" | "fadeIn" | "revealLeft";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: VariantName;
  stagger?: boolean;
  delay?: number;
  forceMotion?: boolean;
};

const VARIANTS: Record<VariantName, any> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  revealLeft: {
    hidden: { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0 },
  },
};

export function AnimatedSection({
  children,
  className,
  id,
  variant = "fadeUp",
  stagger = false,
  delay = 0,
  forceMotion = false,
}: AnimatedSectionProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce && !forceMotion) {
    return (
      <div className={className} id={id}>
        {children}
      </div>
    );
  }

  const transition = { duration: 0.55, delay };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={VARIANTS[variant]}
      transition={transition}
      className={className}
      id={id}
    >
      {children}
    </motion.div>
  );
}
