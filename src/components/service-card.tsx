"use client";

import Link from "next/link";
import { AnimatedItem } from "./animated-item";
import type { FC } from "react";

type ServiceCardProps = {
  title: string;
  description: string;
  image?: string;
  bullets?: string[];
  href?: string;
};

export const ServiceCard: FC<ServiceCardProps> = ({ title, description, image, bullets = [], href = "#" }) => {
  return (
    <AnimatedItem className="service-card hover:shadow-xl transition">
      <div className="flex items-start gap-4">
        <div className="icon-wrap" aria-hidden>
          {image ? <img src={image} alt="" width={40} height={40} /> : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="#b9995f" strokeWidth="1.5" fill="none" />
              <path d="M8 12h8" stroke="#b9995f" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="title text-xl">{title}</h3>
          <p className="desc mt-2 text-sm">{description}</p>
          {bullets.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full" style={{backgroundColor: 'var(--accent)'}} />{b}</li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Link href={href} className="text-sm font-semibold" style={{color: 'var(--accent)'}}>מידע נוסף →</Link>
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
};
