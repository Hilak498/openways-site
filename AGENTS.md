<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# עיצוב - ספר המותג הוא מקור האמת

לפני כל שינוי שנוגע לצבע, ללוגו, לטיפוגרפיה או לפריסה: לקרוא את
`docs/brand/README.md`. הוא מרכז את פלטת המותג, גרסאות הלוגו, כללי
הניגודיות והטיפוגרפיה בעברית, ומצביע על ספר המותג המקורי שב-
`docs/internal/brand/` (מחוץ למעקב git - הריפו ציבורי).

הכללים שלא נשברים:

- צבעים נלקחים מהטוקנים ב-`src/app/globals.css`. לא להמציא HEX חדש בתוך
  קומפוננטה.
- `gold-300` לרקע כהה, `gold-700` לרקע בהיר. לא להחליף ביניהם.
- הלוגו המלא לא יושב על משטח חול (`sand-*`): זהב הלוגו `#c7a96d` נכשל שם
  בניגודיות. רקע בהיר מקבל `logo-light-bg.png`, רקע כהה `logo-dark-bg.png`.
- כל טקסט ואלמנט גרפי עומד ב-WCAG AA: 4.5:1 לטקסט רגיל, 3:1 לטקסט גדול
  ולגרפיקה. לבדוק לפני שמוסרים.

אחרי שינוי עיצוב שנוגע למותג - לעדכן את `docs/brand/README.md`.
