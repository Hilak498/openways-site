import Link from "next/link";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ServiceIcon } from "@/components/service-icon";
import { ContactForm } from "@/components/contact-form";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema } from "@/lib/schema";
import { services, site, testimonials, whyUs } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />

      <Hero />

      {/* Services overview */}
      <section id="services" className="scroll-mt-24 bg-sand-50 py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="השירותים שלנו"
            title="שלוש דרכים, יעד אחד: הצלחה פיננסית"
            description="כל שירות עומד בפני עצמו — וביחד הם מכסים את כל הצמתים הפיננסיים של העסק ושל המשפחה."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={i * 0.1} className="h-full">
                <article className="card group flex h-full flex-col p-8 transition duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-700 transition group-hover:bg-gold-500/25">
                    <ServiceIcon icon={service.icon} />
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-navy-800">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-gold-700">
                    {service.tagline}
                  </p>
                  <p className="mt-4 flex-1 leading-7 text-navy-600">
                    {service.summary}
                  </p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-6 inline-flex items-center gap-2 font-bold text-navy-800 transition group-hover:text-gold-700"
                    aria-label={`למידע נוסף על ${service.name}`}
                  >
                    למידע נוסף
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="-scale-x-100 transition-transform group-hover:-translate-x-1"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section id="why-us" className="on-dark scroll-mt-24 bg-navy-900 py-24 text-white">
        <div className="container-site">
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                align="start"
                onDark
                eyebrow="למה Open Ways"
                title="שותף אחד לכל ההחלטות הפיננסיות"
                description="אנחנו לא עוד יועצים. אנחנו שותפים לדרך — עם מתודולוגיה סדורה, מחויבות לתוצאה ואפס אותיות קטנות."
              />
              <Reveal delay={0.15}>
                <Link href="/#contact" className="btn-primary mt-9">
                  בואו נדבר
                </Link>
              </Reveal>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2">
              {whyUs.map((item, i) => (
                <Reveal key={item.title} as="li" delay={i * 0.08}>
                  <div className="glass-dark h-full p-6">
                    <span
                      className="text-2xl font-extrabold text-gold-400"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/70">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-24 py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="לקוחות מספרים"
            title="התוצאות מדברות בעד עצמן"
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1} className="h-full">
                <figure className="card flex h-full flex-col p-8">
                  <svg
                    width="32"
                    height="24"
                    viewBox="0 0 32 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="text-gold-400"
                  >
                    <path d="M0 24V14.4C0 6.5 4.8 1.2 12.8 0l1.6 3.8c-4.3 1.3-6.6 3.7-6.9 7h6.1V24H0Zm18.4 0V14.4c0-7.9 4.8-13.2 12.8-14.4l1.6 3.8c-4.3 1.3-6.6 3.7-6.9 7H32V24H18.4Z" />
                  </svg>
                  <blockquote className="mt-5 flex-1 leading-8 text-navy-700">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-navy-800/10 pt-4">
                    <span className="block font-bold text-navy-800">{t.name}</span>
                    <span className="text-sm text-navy-600">{t.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 bg-sand-50 py-24">
        <div className="container-site">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <SectionHeading
                align="start"
                eyebrow="יצירת קשר"
                title="נתחיל בשיחה אחת טובה"
                description="השאירו פרטים ונחזור אליכם בתוך יום עסקים לשיחת היכרות ראשונית — ללא עלות וללא התחייבות."
              />
              <Reveal delay={0.1}>
                <ul className="mt-8 space-y-4 text-navy-700">
                  <li className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.27a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2Z" />
                      </svg>
                    </span>
                    <a href={`tel:${site.phone}`} className="font-semibold hover:text-gold-700" dir="ltr">
                      {site.phoneDisplay}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-10 6L2 7" />
                      </svg>
                    </span>
                    <a href={`mailto:${site.email}`} className="font-semibold hover:text-gold-700" dir="ltr">
                      {site.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span>
                      {site.address.street}, {site.address.city}
                    </span>
                  </li>
                </ul>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="lg:col-span-3">
              <div className="card p-8 sm:p-10">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
