#!/usr/bin/env python3
"""
בונה הצעת מחיר מעוצבת (HTML + PDF) בשפת העיצוב של אתר Open Ways.

    python3 build_quote.py payload.json [--config services.json] [--out DIR] [--no-pdf]

הפלט: <out>/<מספר הצעה>/quote.html ו-quote.pdf, ובסוף שורת JSON עם הנתיבים
ועם סכום ההצעה - כדי שהסוכן יוכל לצרף אותם למייל ולרשום אותם למעקב.

מבנה payload.json:
{
  "service": "mortgage-complex",
  "client": {"name": "...", "company": "...", "email": "...", "phone": "...", "taxId": "..."},
  "scopeNote": "משפט אחד שמסביר למה התיק נכנס לרמה הזו (מופיע בהצעה)",
  "overrides": {"price": 12000, "percent": 3.5, "includes": [...], "excludes": [...],
                "validityDays": 21, "discount": {"label": "הנחת היכרות", "amount": 1000}}
}
"""

import argparse
import base64
import csv
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date, timedelta
from html import escape
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = SKILL_DIR.parent.parent.parent


# ---------------------------------------------------------------- helpers ---

def die(msg: str) -> None:
    print(f"שגיאה: {msg}", file=sys.stderr)
    sys.exit(1)


def money(value, currency="₪"):
    """סכום עם מפריד אלפים, מבודד ל-LTR כדי שלא יתהפך בעברית."""
    sign = "-" if value < 0 else ""
    return f'<span dir="ltr">{sign}{currency}{abs(value):,.0f}</span>'


def find_chrome():
    env = Path(sys.argv[0]).parent  # placeholder, keeps linters quiet
    for pattern in ("/opt/pw-browsers/chromium-*/chrome-linux/chrome",
                    "/opt/pw-browsers/chromium-*/chrome-linux64/chrome"):
        hits = sorted(Path("/").glob(pattern.lstrip("/")))
        if hits:
            return str(hits[-1])
    for name in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        found = shutil.which(name)
        if found:
            return found
    return None


def next_quote_number(out_dir: Path, tracking: Path) -> str:
    """מספור רץ לפי השנה: OW-2026-001."""
    year = date.today().year
    used = set()
    if tracking.exists():
        with tracking.open(encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                used.add(row.get("quote_number", ""))
    if out_dir.exists():
        used.update(p.name for p in out_dir.iterdir() if p.is_dir())
    seq = 0
    for num in used:
        m = re.fullmatch(rf"OW-{year}-(\d+)", num)
        if m:
            seq = max(seq, int(m.group(1)))
    return f"OW-{year}-{seq + 1:03d}"


def require(value, field: str):
    if value in (None, "", []):
        die(f"חסר ערך בשדה '{field}' ב-services.json. אי אפשר להפיק הצעת מחיר בלי זה.")
    return value


# ------------------------------------------------------------------ render ---

CSS = """
:root{
  --navy-900:#0a192f; --navy-800:#0d1c32; --navy-700:#152542; --navy-600:#44474d;
  --gold-300:#ffe088; --gold-400:#fed65b; --gold-500:#e9c349; --gold-700:#735c00;
  --gold-ink:#241a00; --sand-50:#fbf9fb; --sand-100:#f5f3f5; --sand-300:#e4e2e4;
  --font-sans:Heebo,Assistant,"Segoe UI",system-ui,-apple-system,Arial,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--sand-300);color:var(--navy-800);font-family:var(--font-sans);
     font-size:12.5px;line-height:1.65;-webkit-font-smoothing:antialiased}
.sheet{width:210mm;min-height:297mm;margin:20px auto;background:#fff;padding:14mm 14mm 12mm;
       box-shadow:0 20px 40px -15px rgb(0 0 0/.25)}

/* letterhead */
.head{background:radial-gradient(circle at 78% 25%,#152542 0%,#0a192f 100%);color:#fff;
      border-radius:16px;padding:16px 20px;display:flex;justify-content:space-between;
      align-items:flex-start;gap:20px}
.head img{height:36px;width:auto;display:block}
.head .meta{text-align:left;font-size:11px;color:rgb(255 255 255/.85);line-height:1.7}
.head .meta b{color:var(--gold-300)}
.doc-title{font-size:19px;font-weight:800;margin:10px 0 0}
.doc-sub{font-size:11.5px;color:rgb(255 255 255/.8);margin:2px 0 0}
.ltr{direction:ltr;unicode-bidi:isolate}

/* blocks */
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.box{border:1px solid rgb(10 25 47/.1);border-radius:14px;padding:11px 14px;background:var(--sand-50)}
.box h3{font-size:10.5px;font-weight:700;letter-spacing:.12em;color:var(--gold-700);margin:0 0 6px}
.box p{margin:0;font-size:12px;line-height:1.7}
.box .name{font-weight:800;font-size:13px}

h2.sec{font-size:14px;font-weight:800;margin:18px 0 0;color:var(--navy-800)}
.bar{width:40px;height:3px;border-radius:999px;background:var(--gold-700);margin:5px 0 9px}
section{break-inside:avoid}

.lead{font-size:12.5px;line-height:1.75;color:var(--navy-600);margin:0}
.scope{margin:8px 0 0;padding:9px 13px;border-radius:12px;background:var(--sand-100);
       border-inline-start:3px solid var(--gold-500);font-size:11.5px;line-height:1.65}

/* price */
.price{border:1px solid rgb(115 92 0/.25);border-radius:16px;overflow:hidden;margin-top:9px;
       background:linear-gradient(180deg,rgb(254 214 91/.16) 0%,rgb(254 214 91/.05) 100%)}
.price table{width:100%;border-collapse:collapse}
.price td{padding:8px 16px;font-size:12.5px;border-bottom:1px solid rgb(115 92 0/.14)}
.price td:last-child{text-align:left;font-weight:700;white-space:nowrap}
.price tr:last-child td{border-bottom:0;font-size:15px;font-weight:800;color:var(--gold-700);
                        background:rgb(254 214 91/.2)}
.price .headline{font-size:22px;font-weight:800;color:var(--gold-700);padding:14px 16px 4px;line-height:1.2}
.price .headline small{display:block;font-size:11.5px;font-weight:600;color:var(--navy-600);margin-top:3px}
.fee-note{font-size:11px;color:var(--navy-600);margin:7px 0 0}

/* lists */
ul.check,ul.plain{margin:0;padding:0;list-style:none}
ul.check li,ul.plain li{position:relative;padding-inline-start:20px;margin-bottom:5px;
                        font-size:11.8px;line-height:1.6}
ul.check li::before{content:"✓";position:absolute;inset-inline-start:0;top:0;
  color:var(--gold-700);font-weight:700}
ul.plain li::before{content:"";position:absolute;inset-inline-start:3px;top:8px;width:5px;height:5px;
  border-radius:999px;background:var(--navy-600);opacity:.45}
.two-col ul{display:grid;grid-template-columns:1fr 1fr;gap:0 22px;align-items:start}

/* tables */
table.grid{width:100%;border-collapse:collapse;margin-top:4px}
table.grid th,table.grid td{text-align:right;font-size:11.8px;padding:6px 10px;
                            border-bottom:1px solid rgb(10 25 47/.09)}
table.grid th{font-size:10.5px;letter-spacing:.08em;color:var(--gold-700);font-weight:700}
table.grid td:last-child{text-align:left;white-space:nowrap;font-weight:600}

ol.terms{margin:0;padding-inline-start:18px;font-size:11.3px;line-height:1.7;color:var(--navy-600)}
ol.terms li{margin-bottom:3px}

/* signatures */
.sign{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:16px;break-inside:avoid}
.sign div{border-top:1px solid rgb(10 25 47/.25);padding-top:7px;font-size:11px;color:var(--navy-600)}
.sign b{display:block;color:var(--navy-800);font-size:12px;margin-bottom:22px}
.accept{margin-top:12px;padding:10px 14px;border-radius:12px;background:var(--navy-900);color:#fff;
        font-size:11.5px;line-height:1.6;break-inside:avoid}
.accept b{color:var(--gold-300)}

.foot{margin-top:14px;padding-top:9px;border-top:1px solid rgb(10 25 47/.12);
      display:flex;justify-content:space-between;gap:14px;font-size:10.5px;color:var(--navy-600)}

@page{size:A4;margin:12mm 0}
@media print{
  body{background:#fff}
  .sheet{width:auto;min-height:0;margin:0;padding:0 14mm;box-shadow:none}
}
.head,.price,.price tr:last-child td,.accept,.box,.scope{
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
@media screen and (max-width:780px){
  .sheet{width:100%;padding:14px;margin:0}
  .row,.two-col,.sign{grid-template-columns:1fr}
  .head{flex-direction:column}
}
"""


def li_list(items, cls="check"):
    return f'<ul class="{cls}">' + "".join(f"<li>{escape(str(i))}</li>" for i in items) + "</ul>"


def build_html(cfg, svc, payload, quote_no, today, valid_until, pricing):
    biz = cfg["business"]
    fin = cfg["finance"]
    client = payload.get("client", {})
    logo_path = REPO_ROOT / biz.get("logoPath", "public/logo-dark-bg.png")
    logo = ""
    if logo_path.exists():
        logo = ("data:image/png;base64,"
                + base64.b64encode(logo_path.read_bytes()).decode())

    client_lines = [escape(client.get("company") or client.get("name", ""))]
    if client.get("company") and client.get("name"):
        client_lines.append(escape(f'לידי {client["name"]}'))
    if client.get("taxId"):
        client_lines.append(escape(f'ח.פ/ע.מ {client["taxId"]}'))
    for key in ("email", "phone"):
        if client.get(key):
            client_lines.append(f'<span class="ltr">{escape(client[key])}</span>')

    scope = payload.get("scopeNote", "")
    scope_html = f'<p class="scope">{escape(scope)}</p>' if scope else ""

    includes = payload.get("overrides", {}).get("includes") or svc["includes"]
    excludes = payload.get("overrides", {}).get("excludes") or svc.get("excludes", [])

    timeline = "".join(
        f'<tr><td>{escape(s["step"])}</td><td>{escape(s["when"])}</td></tr>'
        for s in svc.get("timeline", []))
    payments = "".join(
        f'<tr><td>{escape(s["milestone"])}</td><td>{escape(s["part"])}</td></tr>'
        for s in svc.get("paymentSchedule", []))

    terms = [t.replace("{validityDays}", str(pricing["validity_days"]))
             for t in cfg.get("generalTerms", [])]
    if svc.get("feeNote"):
        terms.insert(0, svc["feeNote"])
    terms_html = "".join(f"<li>{escape(t)}</li>" for t in terms)

    excludes_block = ""
    if excludes:
        excludes_block = f"""
    <section>
      <h2 class="sec">מה לא כלול</h2><div class="bar"></div>
      {li_list(excludes, "plain")}
    </section>"""

    return f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>הצעת מחיר {escape(quote_no)} - {escape(svc['name'])}</title>
<style>{CSS}</style>
</head>
<body>
<article class="sheet">

  <header class="head">
    <div>
      {'<img src="' + logo + '" alt="Open Ways">' if logo else '<b>Open Ways</b>'}
      <h1 class="doc-title">הצעת מחיר</h1>
      <p class="doc-sub">{escape(svc['family'])} · {escape(svc['name'])}</p>
    </div>
    <div class="meta">
      <div>מספר הצעה <b class="ltr">{escape(quote_no)}</b></div>
      <div>תאריך <b class="ltr">{today.strftime('%d/%m/%Y')}</b></div>
      <div>בתוקף עד <b class="ltr">{valid_until.strftime('%d/%m/%Y')}</b></div>
    </div>
  </header>

  <div class="row">
    <div class="box">
      <h3>לכבוד</h3>
      <p class="name">{client_lines[0]}</p>
      <p>{'<br>'.join(client_lines[1:])}</p>
    </div>
    <div class="box">
      <h3>מאת</h3>
      <p class="name">{escape(require(biz.get('legalName'), 'business.legalName'))}</p>
      <p>{escape(biz.get('signer', {}).get('name') or '')}
         {escape('· ' + biz['signer']['role'] if biz.get('signer', {}).get('role') else '')}<br>
         <span class="ltr">{escape(require(biz.get('phone'), 'business.phone'))}</span> ·
         <span class="ltr">{escape(require(biz.get('email'), 'business.email'))}</span><br>
         ח.פ/ע.מ <span class="ltr">{escape(require(biz.get('companyId'), 'business.companyId'))}</span></p>
    </div>
  </div>

  <section>
    <h2 class="sec">השירות</h2><div class="bar"></div>
    <p class="lead">{escape(svc['summary'])}</p>
    {scope_html}
  </section>

  <section>
    <h2 class="sec">שכר טרחה</h2><div class="bar"></div>
    <div class="price">{pricing['html']}</div>
    {f'<p class="fee-note">{escape(fin["vatNote"])}</p>' if fin.get('vatNote') and svc['pricingModel'] == 'success_percent' else ''}
  </section>

  <section>
    <h2 class="sec">מה כולל השירות</h2><div class="bar"></div>
    <div class="two-col">{li_list(includes)}</div>
  </section>
{excludes_block}

  <section>
    <h2 class="sec">שלבי העבודה</h2><div class="bar"></div>
    <table class="grid"><tr><th>שלב</th><th>מסגרת זמן</th></tr>{timeline}</table>
  </section>

  <section>
    <h2 class="sec">תנאי תשלום</h2><div class="bar"></div>
    <table class="grid"><tr><th>אבן דרך</th><th>חלק מהתשלום</th></tr>{payments}</table>
  </section>

  <section>
    <h2 class="sec">תנאים כלליים</h2><div class="bar"></div>
    <ol class="terms">{terms_html}</ol>
  </section>

  <div class="accept">
    <b>אישור ההצעה</b>
    חתימה על הצעה זו מהווה הסכמה לתנאיה ולתחילת העבודה. ניתן להשיב בחתימה סרוקה
    או באישור חוזר במייל - שניהם קבילים.
  </div>

  <div class="sign">
    <div><b>הלקוח</b>שם, תאריך וחתימה</div>
    <div><b>{escape(biz.get('brandName', 'Open Ways'))}</b>{escape(biz.get('signer', {}).get('name') or '')} · תאריך וחתימה</div>
  </div>

  <div class="foot">
    <span>{escape(biz.get('legalName', ''))} · ח.פ/ע.מ <span class="ltr">{escape(str(biz.get('companyId', '')))}</span></span>
    <span class="ltr">{escape(biz.get('website', ''))}</span>
  </div>

</article>
</body>
</html>
"""


def build_pricing(cfg, svc, payload):
    """מרכיב את בלוק שכר הטרחה ומחזיר גם את הסכום למעקב."""
    fin = cfg["finance"]
    cur = fin.get("currency", "₪")
    vat = float(fin.get("vatRate", 0))
    ov = payload.get("overrides", {})
    validity = int(ov.get("validityDays") or fin.get("validityDays", 14))
    model = svc["pricingModel"]

    if model == "success_percent":
        pct = ov.get("percent", svc.get("percent"))
        if pct in (None, ""):
            die(f"לשירות '{svc['id']}' לא הוגדר אחוז שכר טרחה (percent) ב-services.json.")
        rows = ""
        min_fee = ov.get("minFee", svc.get("minFee"))
        if min_fee:
            rows += f"<tr><td>שכר טרחה מינימלי</td><td>{money(float(min_fee), cur)}</td></tr>"
        retainer = ov.get("retainerFee", svc.get("retainerFee"))
        if retainer:
            rows += (f"<tr><td>דמי טיפול מראש (מקוזזים משכר הטרחה)</td>"
                     f"<td>{money(float(retainer), cur)}</td></tr>")
        html = (f'<div class="headline"><span dir="ltr">{pct}%</span>'
                f'<small>מהיקף המימון שיועמד בפועל</small></div>'
                f'<table>{rows}<tr><td>מועד החיוב</td><td>עם העמדת האשראי</td></tr></table>')
        return {"html": html, "amount": None, "amount_label": f"{pct}% מהתיק",
                "validity_days": validity}

    price = ov.get("price", svc.get("price"))
    if price in (None, ""):
        die(f"לשירות '{svc['id']}' לא הוגדר מחיר (price) ב-services.json.")
    price = float(price)
    discount = ov.get("discount")
    rows = ""
    label = "רטיינר חודשי" if model == "monthly_retainer" else "שכר טרחה"
    rows += f"<tr><td>{label}</td><td>{money(price, cur)}</td></tr>"
    if discount:
        price -= float(discount["amount"])
        rows += (f'<tr><td>{escape(discount.get("label", "הנחה"))}</td>'
                 f'<td>{money(-float(discount["amount"]), cur)}</td></tr>')
    if model == "monthly_retainer" and svc.get("minTermMonths"):
        rows += (f'<tr><td>תקופת התחייבות מינימלית</td>'
                 f'<td>{svc["minTermMonths"]} חודשים</td></tr>')
    vat_amount = price * vat / 100
    rows += f'<tr><td>מע"מ {vat:g}%</td><td>{money(vat_amount, cur)}</td></tr>'
    total = price + vat_amount
    total_label = 'סה"כ לתשלום לחודש' if model == "monthly_retainer" else 'סה"כ לתשלום'
    rows += f"<tr><td>{total_label}</td><td>{money(total, cur)}</td></tr>"
    return {"html": f"<table>{rows}</table>", "amount": round(total),
            "amount_label": f"{cur}{round(total):,}" + (" לחודש" if model == "monthly_retainer" else ""),
            "validity_days": validity}


# -------------------------------------------------------------------- main ---

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("payload")
    ap.add_argument("--config", default=str(SKILL_DIR / "services.json"))
    ap.add_argument("--out", default=str(SKILL_DIR / "out"))
    ap.add_argument("--no-pdf", action="store_true")
    args = ap.parse_args()

    cfg_path = Path(args.config)
    if not cfg_path.exists():
        die(f"לא נמצא {cfg_path}. העתק את services.example.json ל-services.json ומלא את המחירים.")
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    payload = json.loads(Path(args.payload).read_text(encoding="utf-8"))

    svc = next((s for s in cfg["services"] if s["id"] == payload.get("service")), None)
    if not svc:
        ids = ", ".join(s["id"] for s in cfg["services"])
        die(f"שירות לא מוכר: {payload.get('service')!r}. האפשרויות: {ids}")

    client = payload.get("client", {})
    if not client.get("name") and not client.get("company"):
        die("חסר שם לקוח או שם חברה ב-payload.")

    out_root = Path(args.out)
    tracking = SKILL_DIR / "tracking.csv"
    quote_no = payload.get("quoteNumber") or next_quote_number(out_root, tracking)
    today = date.today()
    pricing = build_pricing(cfg, svc, payload)
    valid_until = today + timedelta(days=pricing["validity_days"])

    html = build_html(cfg, svc, payload, quote_no, today, valid_until, pricing)
    dest = out_root / quote_no
    dest.mkdir(parents=True, exist_ok=True)
    html_path = dest / "quote.html"
    html_path.write_text(html, encoding="utf-8")

    pdf_path = None
    if not args.no_pdf:
        chrome = find_chrome()
        if chrome:
            target = dest / "quote.pdf"
            with tempfile.TemporaryDirectory() as tmp:
                subprocess.run(
                    [chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
                     f"--user-data-dir={tmp}", "--no-pdf-header-footer",
                     f"--print-to-pdf={target}", html_path.as_uri()],
                    check=True, capture_output=True, timeout=120)
            pdf_path = target
        else:
            print("אזהרה: לא נמצא דפדפן Chromium - נוצר HTML בלבד.", file=sys.stderr)

    print(json.dumps({
        "quote_number": quote_no,
        "service_id": svc["id"],
        "service_name": svc["name"],
        "family": svc["family"],
        "client": client.get("company") or client.get("name"),
        "client_email": client.get("email", ""),
        "amount": pricing["amount"],
        "amount_label": pricing["amount_label"],
        "date": today.isoformat(),
        "valid_until": valid_until.isoformat(),
        "html": str(html_path),
        "pdf": str(pdf_path) if pdf_path else None,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
