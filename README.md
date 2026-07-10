# Open Ways — Website

This repository contains the Next.js website for Open Ways. It includes three service areas: ייעוץ עסקי, ייעוץ משכנתאות ליועצי משכנתאות, and גיוס אשראי עסקי.

## Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
# Open http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Deploy to Vercel (linked)

This project is linked to Vercel under the team `Hila's projects` as `openways-site`.

Production URL (deployed):

- https://openways-site.vercel.app

To deploy from the command line:

```bash
vercel deploy --prod
```

## Files & Structure

- `src/app/page.tsx` — Home page (Hebrew)
- `src/app/services/` — Service pages
- `src/components/` — Shared components (logo, contact form, cookie banner)
- `public/logo.svg` — Project logo used in the header

## Notes

- Cookie consent and basic privacy/cookies/terms pages are included in `src/app`.
- The repository is ready for continuous deployment on Vercel; the project is linked and a production deployment was created.

If you want, I can add environment variables, analytics IDs, or a CMS connection next.
