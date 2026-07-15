import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <section className="on-dark flex min-h-svh items-center bg-navy-900 text-white">
      <div className="container-site py-32 text-center">
        <LogoMark className="mx-auto h-16 w-auto text-white" />
        <p className="mt-8 text-sm font-bold tracking-widest text-gold-400">404</p>
        <h1 className="mt-3 text-4xl font-extrabold">הדרך הזאת עוד לא נסללה</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/70">
          העמוד שחיפשתם לא נמצא. אולי הקישור השתנה — או שפשוט נפתחה דרך חדשה.
        </p>
        <Link href="/" className="btn-primary mt-9">
          חזרה לעמוד הבית
        </Link>
      </div>
    </section>
  );
}
