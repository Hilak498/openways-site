import type { ReactNode } from "react";

/**
 * רצועה נעה בלולאה אינסופית.
 *
 * התוכן משוכפל פעמיים, והמסילה זזה חצי מרוחבה - ברגע שהעותק הראשון יוצא
 * מהמסך העותק השני כבר במקומו, ולכן התנועה נראית רציפה. העותק השני מוסתר
 * מקוראי מסך כדי שהתוכן לא יוקרא פעמיים.
 *
 * המסילה עצמה ב-dir="ltr" כדי שהגאומטריה תהיה צפויה, והתוכן שבתוכה חוזר
 * ל-rtl. מי שביקש פחות תנועה במערכת ההפעלה מקבל רצועה סטטית (globals.css).
 */
export function Marquee({
  children,
  /** שניות למחזור מלא - גדול יותר = איטי יותר */
  duration = 60,
  /** כיוון התנועה על המסך */
  direction = "rtl",
  /** עצירה במעבר עכבר */
  pauseOnHover = true,
  gap = "1.5rem",
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  direction?: "rtl" | "ltr";
  pauseOnHover?: boolean;
  gap?: string;
  className?: string;
}) {
  return (
    <div
      className={`marquee ${pauseOnHover ? "marquee-pausable" : ""} ${className}`}
    >
      <div
        dir="ltr"
        className="marquee-track"
        style={
          {
            "--marquee-duration": `${duration}s`,
            "--marquee-gap": gap,
            animationDirection: direction === "ltr" ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        <div dir="rtl" className="marquee-group">
          {children}
        </div>
        <div dir="rtl" className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
