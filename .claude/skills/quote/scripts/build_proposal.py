#!/usr/bin/env python3
"""
בונה הצעת מחיר אישית של 4 עמודים במיתוג Open Ways.

    python3 build_proposal.py payload.json [--config services.json] [--out DIR] [--no-pdf]

המבנה: עמוד פתיחה אישי · תחומי העבודה · מסלולי הליווי והמחירים · תנאים ואישור הזמנה.
הפורמט הזה מתאים להצעת ליווי שנשלחת אחרי פגישת היכרות. להצעה קצרה וענייניתb
של שירות בודד יש את build_quote.py.

payload.json - כל שדה שלא נמסר נלקח מ-services.json או מושמט בשקט:
{
  "title": "ליווי עסקי",
  "client": {"name": "...", "business": "...", "entity": "עוסק פטור",
             "email": "...", "phone": "..."},
  "letter": ["פסקה אישית ללקוחה", "עוד פסקה"],
  "goal": {"headline": "היעד הבא לעסק שלך",
           "paragraphs": ["..."],
           "focus": [{"title": "ניתוח נתונים ורווחיות", "text": "..."}]},
  "domains": [{"title": "כספים ופיננסים", "items": [{"title": "...", "text": "..."}]}],
  "tracks": ["business-basic", "business-growth", "business-flex", "business-premium"],
  "closing": "משפט סיום אישי"
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


def rich(text):
    """טקסט של המשתמשת: מנוטרל, אבל עם <b> מותר להדגשה."""
    out = escape(str(text))
    return out.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")


def die(msg):
    print(f"שגיאה: {msg}", file=sys.stderr)
    sys.exit(1)


def data_uri(path: Path):
    if not path or not Path(path).exists():
        return None
    p = Path(path)
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
            "webp": "image/webp"}.get(p.suffix.lstrip(".").lower(), "image/png")
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()


def find_chrome():
    hits = sorted(Path("/").glob("opt/pw-browsers/chromium-*/chrome-linux/chrome"))
    if hits:
        return str(hits[-1])
    for name in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        found = shutil.which(name)
        if found:
            return found
    return None


def next_quote_number(out_dir: Path, tracking: Path) -> str:
    year = date.today().year
    used = set()
    if tracking.exists():
        with tracking.open(encoding="utf-8-sig") as fh:
            used.update(r.get("quote_number", "") for r in csv.DictReader(fh))
    if out_dir.exists():
        used.update(p.name for p in out_dir.iterdir() if p.is_dir())
    seq = max([int(m.group(1)) for m in
               (re.fullmatch(rf"OW-{year}-(\d+)", u) for u in used) if m] or [0])
    return f"OW-{year}-{seq + 1:03d}"


def money(value, currency="₪"):
    return f'<span dir="ltr">{currency}{value:,.0f}</span>'


def price_line(svc, currency="₪"):
    """שורת המחיר של מסלול, לפי מודל התמחור שלו."""
    model = svc["pricingModel"]
    if model == "success_percent":
        pct = svc.get("percent")
        if pct in (None, ""):
            die(f"למסלול '{svc['id']}' לא הוגדר אחוז שכר טרחה ב-services.json.")
        return f'<span dir="ltr">{pct}%</span> מהיקף המימון שיועמד'
    price = svc.get("price")
    if price in (None, ""):
        die(f"למסלול '{svc['id']}' לא הוגדר מחיר ב-services.json. "
            f"מלאי את השדה price או הסירי את המסלול מרשימת ה-tracks.")
    price = float(price)
    if model == "monthly_retainer":
        return f"{money(price, currency)} לחודש"
    if model == "punch_card":
        return f"{money(price, currency)} לכרטיסייה"
    return money(price, currency)


CSS = """
:root{
  --navy-900:#0a192f;--navy-800:#0d1c32;--navy-700:#152542;--navy-600:#44474d;
  --gold-300:#ffe088;--gold-400:#fed65b;--gold-500:#e9c349;--gold-700:#735c00;
  --gold-ink:#241a00;--sand-50:#fbf9fb;--sand-100:#f5f3f5;--sand-200:#efedef;--sand-300:#e4e2e4;
  --font:Heebo,Assistant,"Segoe UI",system-ui,-apple-system,Arial,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--sand-300);color:var(--navy-800);font-family:var(--font);
     font-size:13px;line-height:1.75;-webkit-font-smoothing:antialiased}
.page{width:210mm;min-height:297mm;margin:20px auto;background:#fff;padding:14mm 16mm 12mm;
      box-shadow:0 20px 40px -15px rgb(0 0 0/.25);position:relative;overflow:hidden;
      display:flex;flex-direction:column}
.page::before{content:"";position:absolute;inset-inline-end:-90px;bottom:-120px;width:420px;height:420px;
      border-radius:999px;background:rgb(254 214 91/.07);pointer-events:none}
.page>*{position:relative}

/* ---------- כותרת עמוד ---------- */
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;
        padding-bottom:12px;border-bottom:1px solid rgb(10 25 47/.1)}
.topbar img{height:40px;width:auto;display:block}
.topbar .date{font-size:11.5px;color:var(--navy-600);letter-spacing:.02em}
.topbar .tag{font-size:11px;font-weight:600;letter-spacing:.14em;color:var(--gold-700)}
.ltr{direction:ltr;unicode-bidi:isolate}

/* ---------- עמוד 1 ---------- */
.title{text-align:center;margin:22px 0 0}
.title h1{font-size:29px;font-weight:800;margin:0;letter-spacing:-.01em}
.title h1 span{color:var(--gold-700)}
.title .who{font-size:14px;font-weight:700;margin:9px 0 0}
.title .meta{font-size:11.5px;color:var(--navy-600);margin:3px 0 0}

.letter{margin-top:18px;padding:15px 20px;border-radius:18px;color:#fff;
        background:radial-gradient(circle at 80% 20%,#152542 0%,#0a192f 100%)}
.letter p{margin:0 0 6px;font-size:12.4px;line-height:1.75;color:rgb(255 255 255/.92)}
.letter p:last-child{margin-bottom:0}
.letter b{color:var(--gold-300);font-weight:700}

.hero{display:flex;gap:18px;align-items:flex-start;margin-top:18px}
.hero .photo{flex:none;width:108px;height:130px;border-radius:16px;overflow:hidden;
             background:var(--sand-100);border:1px solid rgb(10 25 47/.1);
             display:grid;place-items:center;color:var(--navy-600);font-size:10.5px}
.hero .photo img{width:100%;height:100%;object-fit:cover;display:block}
.hero .greet{font-size:12px;font-weight:600;letter-spacing:.1em;color:var(--gold-700);margin:0}
.hero h2{font-size:17px;font-weight:800;margin:3px 0 0}
.hero h2 small{display:block;font-size:12px;font-weight:600;color:var(--gold-700);margin-top:2px}
.hero p{font-size:12px;line-height:1.75;color:var(--navy-600);margin:7px 0 0}
.hero .credo{margin-top:9px;font-size:12.5px;font-weight:700;color:var(--navy-800)}
.hero .credo::before{content:"";display:inline-block;width:22px;height:2px;border-radius:2px;
                     background:var(--gold-500);vertical-align:middle;margin-inline-end:8px}

h2.sec{font-size:19px;font-weight:800;margin:20px 0 0}
h2.sec span{color:var(--gold-700)}
.bar{width:46px;height:3px;border-radius:999px;background:var(--gold-700);margin:7px 0 12px}
.lead{font-size:12.4px;line-height:1.8;color:var(--navy-600);margin:0 0 9px}
.lead b{color:var(--navy-800)}

ul.focus{margin:0;padding:0;list-style:none}
ul.focus li{position:relative;padding:8px 32px 8px 13px;margin-bottom:7px;border-radius:14px;
            background:var(--sand-100);border:1px solid rgb(10 25 47/.06);
            font-size:12.2px;line-height:1.7;break-inside:avoid}
ul.focus li::before{content:"";position:absolute;inset-inline-start:14px;top:16px;width:9px;height:9px;
                    border-radius:3px;background:linear-gradient(135deg,var(--gold-300),var(--gold-500))}
ul.focus b{color:var(--navy-800)}

/* ---------- עמוד 2: תחומי עבודה ---------- */
.domain{margin-top:16px;break-inside:avoid}
.domain h3{font-size:15px;font-weight:800;margin:0;padding:8px 16px;border-radius:12px;
           color:#fff;background:linear-gradient(90deg,var(--navy-900),var(--navy-700))}
.domain h3 span{color:var(--gold-300)}
.domain ul{margin:10px 0 0;padding:0;list-style:none}
.domain li{position:relative;padding-inline-start:20px;margin-bottom:7px;font-size:12.2px;line-height:1.7}
.domain li::before{content:"";position:absolute;inset-inline-start:4px;top:9px;width:7px;height:7px;
                   border-radius:999px;border:2px solid var(--gold-500)}
.domain b{color:var(--navy-800)}

/* ---------- עמוד 3: מסלולים ---------- */
.track{margin-top:13px;border:1px solid rgb(10 25 47/.08);border-radius:18px;overflow:hidden;
       box-shadow:0 8px 32px 0 rgb(10 25 47/.06);break-inside:avoid}
.track-head{display:flex;align-items:center;justify-content:space-between;gap:14px;
            padding:10px 18px;color:#fff;background:linear-gradient(90deg,var(--navy-900),var(--navy-700))}
.track-head h3{margin:0;font-size:16px;font-weight:800}
.track-head h3 em{font-style:normal;color:var(--gold-300);letter-spacing:.04em}
.track-head .price{font-size:15px;font-weight:800;color:var(--gold-300);white-space:nowrap}
.track-body{display:flex;gap:18px;padding:12px 18px 14px;background:#fff}
.track-body .main{flex:1}
.track-body .tagline{font-size:12.5px;color:var(--navy-700);margin:0 0 8px;font-weight:600}
.track-body ul{margin:0;padding:0;list-style:none;columns:2;column-gap:20px}
.track-body li{position:relative;padding-inline-start:18px;margin-bottom:4px;font-size:11.8px;
               line-height:1.6;break-inside:avoid}
.track-body li::before{content:"✓";position:absolute;inset-inline-start:0;top:0;
                       color:var(--gold-700);font-weight:700}
.track-fit{flex:none;width:33%;align-self:stretch;padding:10px 13px;border-radius:12px;
           background:linear-gradient(180deg,rgb(254 214 91/.18),rgb(254 214 91/.06));
           border:1px solid rgb(115 92 0/.18);font-size:11.5px;line-height:1.6;color:var(--navy-700)}
.track-fit b{display:block;font-size:10.5px;letter-spacing:.1em;color:var(--gold-700);margin-bottom:3px}

/* ---------- עמוד 3 בגרסת שירות יחיד: שכר טרחה ---------- */
.fee{border:1px solid rgb(115 92 0/.25);border-radius:18px;overflow:hidden;margin-top:4px;
     background:linear-gradient(180deg,rgb(254 214 91/.16) 0%,rgb(254 214 91/.05) 100%)}
.fee .headline{font-size:26px;font-weight:800;color:var(--gold-700);padding:16px 20px 6px;line-height:1.2}
.fee .headline small{display:block;font-size:12.5px;font-weight:600;color:var(--navy-600);margin-top:4px}
.fee table{width:100%;border-collapse:collapse}
.fee td{padding:9px 20px;font-size:13px;border-bottom:1px solid rgb(115 92 0/.14)}
.fee td:last-child{text-align:left;font-weight:700;white-space:nowrap}
.fee tr:last-child td{border-bottom:0;font-size:16px;font-weight:800;color:var(--gold-700);
                      background:rgb(254 214 91/.22)}
.fee-note{font-size:11.5px;color:var(--navy-600);margin:8px 0 0}
.cols ul{display:grid;grid-template-columns:1fr 1fr;gap:0 24px;align-items:start}
ul.tick{margin:0;padding:0;list-style:none}
ul.tick li{position:relative;padding-inline-start:19px;margin-bottom:4px;font-size:12px;line-height:1.6;break-inside:avoid}
ul.tick li::before{content:"✓";position:absolute;inset-inline-start:0;top:0;color:var(--gold-700);font-weight:700}
ul.dot{margin:0;padding:0;list-style:none}
ul.dot li{position:relative;padding-inline-start:19px;margin-bottom:4px;font-size:12px;line-height:1.6;color:var(--navy-600)}
ul.dot li::before,.block ul.dot li::before{content:"";position:absolute;inset-inline-start:5px;top:9px;
                  width:5px;height:5px;border-radius:999px;background:var(--navy-600);opacity:.45}
table.grid{width:100%;border-collapse:collapse;margin-top:2px}
table.grid th,table.grid td{text-align:right;font-size:12.2px;padding:7px 12px;border-bottom:1px solid rgb(10 25 47/.09)}
table.grid th{font-size:10.5px;letter-spacing:.08em;color:var(--gold-700);font-weight:700}
table.grid td:last-child{text-align:left;white-space:nowrap;font-weight:600}

/* ---------- עמוד 4: תנאים ---------- */
.terms{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:12px;margin-top:16px}
.terms .cell{border-radius:16px;padding:12px 15px;font-size:11.5px;line-height:1.65}
.terms .cell.main{color:#fff;background:radial-gradient(circle at 80% 20%,#152542,#0a192f)}
.terms .cell.main h3{margin:0 0 6px;font-size:14px;color:var(--gold-300)}
.terms .cell.alt{background:var(--sand-100);border:1px solid rgb(10 25 47/.07)}
.terms .cell.alt h3{margin:0 0 6px;font-size:12.5px;color:var(--gold-700)}
.terms .cell p{margin:0 0 4px}
.terms dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:2px 10px;font-size:11.5px}
.terms dt{color:var(--navy-600)}
.terms dd{margin:0;font-weight:600}

.block{margin-top:13px;break-inside:avoid}
.block h3{font-size:14px;font-weight:800;margin:0 0 6px}
.block p,.block li{font-size:11.8px;line-height:1.7;color:var(--navy-600)}
.block ul{margin:6px 0 0;padding:0;list-style:none}
.block ul li{position:relative;padding-inline-start:18px;margin-bottom:3px}
.block ul li::before{content:"✓";position:absolute;inset-inline-start:0;top:0;color:var(--gold-700);font-weight:700}
ol.conditions li{padding-inline-start:0;margin-bottom:3px}
ol.conditions{margin:0;padding-inline-start:18px;font-size:11.8px;line-height:1.7;color:var(--navy-600)}

.closing{margin-top:14px;padding:13px 18px;border-radius:18px;background:var(--sand-100);
         border-inline-start:4px solid var(--gold-500);font-size:12.5px;line-height:1.8}
.closing .sig{margin-top:8px;font-weight:800;color:var(--navy-800);font-size:13.5px}

.confirm{margin-top:14px;padding:14px 18px;border:1px dashed rgb(10 25 47/.28);border-radius:18px;break-inside:avoid}
.confirm h3{margin:0 0 10px;font-size:13.5px;font-weight:800}
.confirm .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 22px;font-size:11.5px}
.confirm .field{border-bottom:1px solid rgb(10 25 47/.35);padding-bottom:16px}
.confirm .field span{color:var(--navy-600)}

.pagefoot{margin-top:auto;padding-top:12px;border-top:1px solid rgb(10 25 47/.12);
          display:flex;justify-content:space-between;align-items:flex-end;gap:16px;
          font-size:11px;color:var(--navy-600)}
.pagefoot .contact div{margin-bottom:2px}
.pagefoot img{height:30px;width:auto;opacity:.9}

@page{size:A4;margin:0}
@media print{
  body{background:#fff}
  .page{width:auto;min-height:295mm;margin:0;box-shadow:none;break-after:page}
  .page:last-child{break-after:auto}
}
.letter,.domain h3,.track-head,.track-fit,.terms .cell,.closing,ul.focus li,.track,.fee,.fee tr:last-child td,.page::before{
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
@media screen and (max-width:780px){
  .page{width:100%;min-height:0;margin:0 0 12px;padding:18px}
  .hero,.track-body,.terms,.confirm .grid{flex-direction:column;grid-template-columns:1fr}
  .track-fit{width:100%}
  .track-body ul{columns:1}
}
"""


def fee_block(cfg, svc):
    """בלוק שכר הטרחה לשירות בודד: מספר אחד גדול, ופירוט מתחתיו."""
    fin = cfg["finance"]
    cur = fin.get("currency", "₪")
    vat = float(fin.get("vatRate", 0))
    model = svc["pricingModel"]

    if model == "success_percent":
        pct = svc.get("percent")
        if pct in (None, ""):
            die(f"לשירות '{svc['id']}' לא הוגדר אחוז שכר טרחה ב-services.json.")
        rows = ""
        if svc.get("minFee"):
            rows += f"<tr><td>שכר טרחה מינימלי</td><td>{money(float(svc['minFee']), cur)}</td></tr>"
        rows += "<tr><td>מועד החיוב</td><td>עם העמדת האשראי בפועל</td></tr>"
        head = (f'<div class="headline"><span dir="ltr">{pct}%</span>'
                f'<small>מהיקף המימון שיועמד בפועל</small></div>')
        note = svc.get("feeNote", "")
        return f'<div class="fee">{head}<table>{rows}</table></div>', note

    price = svc.get("price")
    if price in (None, ""):
        die(f"לשירות '{svc['id']}' לא הוגדר מחיר ב-services.json.")
    price = float(price)
    unit = {"monthly_retainer": "לחודש", "punch_card": "לכרטיסייה"}.get(model, "")
    sub = {"monthly_retainer": "ריטיינר חודשי", "punch_card": "כרטיסייה",
           "fixed": "שכר טרחה לתהליך"}.get(model, "שכר טרחה")
    if svc.get("minTermMonths"):
        sub += f" · התחייבות ל-{svc['minTermMonths']} חודשים"
    head = (f'<div class="headline">{money(price, cur)}{" " + unit if unit else ""}'
            f'<small>{escape(sub)}</small></div>')
    vat_amount = price * vat / 100
    rows = (f'<tr><td>מע"מ {vat:g}%</td><td>{money(vat_amount, cur)}</td></tr>'
            f'<tr><td>סה"כ לתשלום{" לחודש" if unit == "לחודש" else ""}</td>'
            f'<td>{money(price + vat_amount, cur)}</td></tr>')
    return f'<div class="fee">{head}<table>{rows}</table></div>', ""


def topbar(logo, today, tag):
    img = f'<img src="{logo}" alt="Open Ways">' if logo else "<b>Open Ways</b>"
    return (f'<div class="topbar"><span class="date ltr">{today.strftime("%d.%m.%Y")}</span>'
            f'{img}<span class="tag">{escape(tag)}</span></div>')


def pagefoot(biz, logo):
    social = ""
    return (f'<div class="pagefoot"><div class="contact">'
            f'<div><span class="ltr">{escape(biz.get("phone",""))}</span></div>'
            f'<div><span class="ltr">{escape(biz.get("email",""))}</span></div>'
            f'<div><span class="ltr">{escape(biz.get("website",""))}</span></div>{social}</div>'
            f'{f"<img src={logo!r} alt=Open Ways>" if logo else ""}</div>')


def build_html(cfg, payload, quote_no, today, tracks):
    biz = cfg["business"]
    prop = cfg.get("proposal", {})
    hero = prop.get("hero", {})
    cur = cfg["finance"].get("currency", "₪")
    # logoPath הוא הנעילה הלבנה לרקע כהה; על נייר לבן צריך את הגרסה הכהה
    logo = data_uri(REPO_ROOT / biz.get("logoLightPath", "public/logo-light-bg.png"))
    photo = data_uri(REPO_ROOT / hero["photoPath"]) if hero.get("photoPath") else None
    client = payload.get("client", {})
    tag = escape(f"הצעה {quote_no}")

    # ---- עמוד 1 ----
    meta = " · ".join(filter(None, [client.get("entity", ""),
                                    client.get("email", ""), client.get("phone", "")]))
    letter = "".join(f"<p>{rich(p)}</p>" for p in payload.get("letter", []))
    bio = "".join(f"<p>{rich(p)}</p>" for p in (hero.get("paragraphs") or []) if p)
    goal = payload.get("goal", {})
    goal_paras = "".join(f'<p class="lead">{rich(p)}</p>' for p in goal.get("paragraphs", []))
    focus = "".join(f'<li><b>{escape(f["title"])}</b> - {escape(f["text"])}</li>'
                    for f in goal.get("focus", []))

    page1 = f"""
<article class="page">
  {topbar(logo, today, tag)}
  <div class="title">
    <h1>הצעת מחיר <span>· {escape(payload.get('title', ''))}</span></h1>
    <p class="who">{escape(client.get('name',''))}{' | ' + escape(client['business']) if client.get('business') else ''}</p>
    <p class="meta ltr">{escape(meta)}</p>
  </div>
  {f'<div class="letter">{letter}</div>' if letter else ''}
  <div class="hero">
    <div class="photo">{f'<img src="{photo}" alt="">' if photo else '[תמונה]'}</div>
    <div>
      <p class="greet">{escape(hero.get('greeting') or 'נעים מאוד,')}</p>
      <h2>{escape(hero.get('name') or '[שם]')}<small>{escape(hero.get('role') or '[תפקיד]')}</small></h2>
      {f'<p class="lead" style="margin-top:8px"><b>{escape(hero["headline"])}</b></p>' if hero.get('headline') else ''}
      {bio}
      {f'<p class="credo">{escape(hero["credo"])}</p>' if hero.get('credo') else ''}
    </div>
  </div>
  {f'<h2 class="sec">{escape(goal.get("headline","היעד הבא לעסק שלך"))}</h2><div class="bar"></div>{goal_paras}<ul class="focus">{focus}</ul>' if goal else ''}
  {pagefoot(biz, logo)}
</article>"""

    # ---- עמוד 2 ----
    domains = ""
    for d in payload.get("domains", []):
        items = "".join(f'<li><b>{escape(i["title"])}</b> - {escape(i["text"])}</li>'
                        for i in d["items"])
        domains += (f'<section class="domain"><h3>{escape(d["title"])}</h3>'
                    f'<ul>{items}</ul></section>')
    page2 = f"""
<article class="page">
  {topbar(logo, today, tag)}
  <h2 class="sec">על מה <span>נעבוד יחד</span></h2><div class="bar"></div>
  <p class="lead">{escape(payload.get('domainsIntro', 'שלושת התחומים שבהם נעשה סדר, לפי הסדר שבו הם משפיעים על השורה התחתונה.'))}</p>
  {domains}
  {pagefoot(biz, logo)}
</article>"""

    # ---- עמוד 3 ----
    cards = ""
    for svc in tracks:
        bullets = "".join(f"<li>{escape(b)}</li>" for b in
                          (svc.get("trackBullets") or svc.get("includes", [])[:4]))
        label = svc.get("trackLabel")
        title = (f'מסלול <em>{escape(label)}</em>' if label else escape(svc["name"]))
        cards += f"""
  <div class="track">
    <div class="track-head"><h3>{title}</h3><span class="price">{price_line(svc, cur)}</span></div>
    <div class="track-body">
      <div class="main">
        <p class="tagline">{escape(svc.get('tagline', svc.get('summary','')))}</p>
        <ul>{bullets}</ul>
      </div>
      <div class="track-fit"><b>למי זה מתאים</b>{escape(svc.get('fit') or (svc.get('criteria') or [''])[0])}</div>
    </div>
  </div>"""
    if len(tracks) == 1:
        svc = tracks[0]
        block, note = fee_block(cfg, svc)
        includes = payload.get("includes") or svc.get("includes", [])
        excludes = payload.get("excludes") or svc.get("excludes", [])
        payments = "".join(f'<tr><td>{escape(s["milestone"])}</td><td>{escape(s["part"])}</td></tr>'
                           for s in svc.get("paymentSchedule", []))
        timeline = "".join(f'<tr><td>{escape(s["step"])}</td><td>{escape(s["when"])}</td></tr>'
                           for s in svc.get("timeline", []))
        page3 = f"""
<article class="page">
  {topbar(logo, today, tag)}
  <h2 class="sec">שכר <span>טרחה</span></h2><div class="bar"></div>
  <p class="lead">{escape(payload.get('feeIntro', svc.get('summary', '')))}</p>
  {block}
  {f'<p class="fee-note">{escape(note)}</p>' if note else ''}

  <section class="block"><h3>מה כולל שכר הטרחה</h3>
    <div class="cols"><ul class="tick">{''.join(f'<li>{escape(i)}</li>' for i in includes)}</ul></div>
  </section>

  {f'<section class="block"><h3>מה לא כלול</h3><ul class="dot">' + ''.join(f'<li>{escape(i)}</li>' for i in excludes) + '</ul></section>' if excludes else ''}

  <section class="block"><h3>שלבי העבודה</h3>
    <table class="grid"><tr><th>שלב</th><th>מסגרת זמן</th></tr>{timeline}</table>
  </section>

  <section class="block"><h3>לוח תשלומים</h3>
    <table class="grid"><tr><th>אבן דרך</th><th>חלק מהתשלום</th></tr>{payments}</table>
  </section>
  {pagefoot(biz, logo)}
</article>"""
    else:
        page3 = f"""
<article class="page">
  {topbar(logo, today, tag)}
  <h2 class="sec">הדרך שלך <span>מתחילה כאן</span></h2><div class="bar"></div>
  <p class="lead">{escape(payload.get('tracksIntro', 'בוחרים לפי מה שמתאים היום. אפשר לעבור בין השירותים בהמשך הדרך.'))}</p>
  {cards}
  {pagefoot(biz, logo)}
</article>"""

    # ---- עמוד 4 ----
    pay = prop.get("payment", {})
    bank = pay.get("bank", {})
    notes = "".join(f"<p>{escape(n)}</p>" for n in pay.get("notes", []))
    bank_rows = "".join(
        f"<dt>{escape(lbl)}</dt><dd class='ltr'>{escape(str(bank.get(key)))}</dd>"
        for key, lbl in (("bankName", "בנק"), ("bankNumber", "מס' בנק"),
                         ("branch", "סניף"), ("account", "חשבון"),
                         ("beneficiary", "על שם"))
        if bank.get(key))
    others = "".join(f"<p>{escape(m)}</p>" for m in pay.get("otherMethods", []))
    com = prop.get("commitments", {})
    com_items = "".join(f"<li>{escape(i)}</li>" for i in com.get("items", []))
    conditions = "".join(f"<li>{escape(c)}</li>" for c in prop.get("conditions", []))
    closing = payload.get("closing") or prop.get("closing") or ""

    page4 = f"""
<article class="page">
  {topbar(logo, today, tag)}
  <h2 class="sec">תנאי <span>תשלום</span></h2><div class="bar"></div>
  <div class="terms">
    <div class="cell main"><h3>תנאים</h3>{notes}</div>
    <div class="cell alt"><h3>העברה בנקאית</h3><dl>{bank_rows or '<dt>פרטי חשבון</dt><dd>[להשלמה]</dd>'}</dl></div>
    <div class="cell alt"><h3>אמצעי תשלום נוספים</h3>{others}</div>
  </div>

  <section class="block">
    <h3>{escape(com.get('title', 'התחייבויות'))}</h3>
    <p>{escape(com.get('intro', ''))}</p>
    <ul>{com_items}</ul>
  </section>

  <section class="block">
    <h3>תנאים כלליים</h3>
    <ol class="conditions">{conditions}</ol>
  </section>

  {f'<div class="closing">{escape(closing)}<div class="sig">{escape(cfg["proposal"]["hero"].get("name") or biz.get("brandName",""))}</div></div>' if closing else ''}

  <section class="confirm">
    <h3>אישור הזמנה</h3>
    <div class="grid">
      <div class="field"><span>שם מלא</span></div>
      <div class="field"><span>שם העסק / ח.פ</span></div>
      <div class="field"><span>המסלול הנבחר</span></div>
      <div class="field"><span>תאריך</span></div>
      <div class="field"><span>חתימה</span></div>
      <div class="field"><span>חתימת {escape(biz.get('brandName', 'Open Ways'))}</span></div>
    </div>
  </section>
  {pagefoot(biz, logo)}
</article>"""

    return (f'<!doctype html>\n<html lang="he" dir="rtl">\n<head>\n'
            f'<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f'<title>הצעת מחיר {escape(quote_no)} - {escape(payload.get("title",""))}</title>\n'
            f"<style>{CSS}</style>\n</head>\n<body>\n{page1}{page2}{page3}{page4}\n</body>\n</html>\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("payload")
    ap.add_argument("--config", default=str(SKILL_DIR / "services.json"))
    ap.add_argument("--out", default=str(SKILL_DIR / "out"))
    ap.add_argument("--no-pdf", action="store_true")
    args = ap.parse_args()

    cfg_path = Path(args.config)
    if not cfg_path.exists():
        die(f"לא נמצא {cfg_path}. העתיקי את services.example.json ל-services.json ומלאי את המחירים.")
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    payload = json.loads(Path(args.payload).read_text(encoding="utf-8"))

    by_id = {s["id"]: s for s in cfg["services"]}
    ids = payload.get("tracks")
    if not ids and payload.get("family"):
        ids = [s["id"] for s in cfg["services"] if s["family"] == payload["family"]]
        if not ids:
            die(f"אין בקטלוג שירותים במשפחה {payload['family']!r}.")
    if not ids:
        die("צריך לציין אילו שירותים יופיעו בהצעה: 'tracks' עם מזהי שירות, "
            "או 'family' עם שם משפחת שירות מהקטלוג.")
    tracks = []
    for tid in ids:
        if tid not in by_id:
            die(f"מסלול לא מוכר: {tid!r}. האפשרויות: {', '.join(by_id)}")
        tracks.append(by_id[tid])

    client = payload.get("client", {})
    if not client.get("name") and not client.get("business"):
        die("חסר שם לקוח או שם עסק ב-payload.")

    out_root = Path(args.out)
    quote_no = payload.get("quoteNumber") or next_quote_number(out_root, SKILL_DIR / "tracking.csv")
    today = date.today()
    html = build_html(cfg, payload, quote_no, today, tracks)

    dest = out_root / quote_no
    dest.mkdir(parents=True, exist_ok=True)
    html_path = dest / "proposal.html"
    html_path.write_text(html, encoding="utf-8")

    pdf_path = None
    if not args.no_pdf:
        chrome = find_chrome()
        if chrome:
            pdf_path = dest / "proposal.pdf"
            with tempfile.TemporaryDirectory() as tmp:
                subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
                                f"--user-data-dir={tmp}", "--no-pdf-header-footer",
                                f"--print-to-pdf={pdf_path}", html_path.as_uri()],
                               check=True, capture_output=True, timeout=120)
            raw = pdf_path.read_bytes()
            pages = raw.count(b"/Type /Page") - raw.count(b"/Type /Pages")
            if pages != 4:
                print(f"אזהרה: המסמך יצא ב-{pages} עמודים במקום 4. משהו ארוך מדי לפריסה - "
                      f"בדרך כלל המכתב האישי, פסקת היעד, סעיפי תחומי העבודה, או רשימת "
                      f"מה-כלול של השירות ב-services.json. לקצר ולבנות שוב.", file=sys.stderr)
        else:
            print("אזהרה: לא נמצא Chromium - נוצר HTML בלבד.", file=sys.stderr)

    print(json.dumps({
        "quote_number": quote_no, "format": "proposal",
        "service_id": ",".join(ids),
        "service_name": payload.get("title", ""),
        "family": tracks[0]["family"],
        "client": client.get("business") or client.get("name"),
        "client_email": client.get("email", ""),
        "amount": None,
        "amount_label": " / ".join(price_line(t, cfg["finance"].get("currency", "₪"))
                                   .replace("<span dir=\"ltr\">", "").replace("</span>", "")
                                   for t in tracks),
        "date": today.isoformat(),
        "valid_until": (today + timedelta(days=int(cfg["finance"].get("validityDays", 14)))).isoformat(),
        "html": str(html_path), "pdf": str(pdf_path) if pdf_path else None,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
