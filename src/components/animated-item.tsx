"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedItemProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

const ITEM = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function AnimatedItem({ children, className, id }: AnimatedItemProps) {
  return (
    <motion.div variants={ITEM} className={className} id={id}>
      {children}
    </motion.div>
  );
}
