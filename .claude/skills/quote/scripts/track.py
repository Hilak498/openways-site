#!/usr/bin/env python3
"""
מעקב הצעות מחיר - קובץ CSV אחד, tracking.csv (לא נדחף לגיטהאב).

    python3 track.py add --from-build build.json [--status נשלחה] [--follow-up 2026-09-20]
    python3 track.py update OW-2026-001 --status אושרה --note "חתמו"
    python3 track.py list [--status נשלחה] [--open]
    python3 track.py due            # הצעות שהגיע מועד המעקב שלהן, או שפג תוקפן

הסטטוסים: טיוטה, נשלחה, בבדיקה, אושרה, נדחתה, פג תוקף.
"""

import argparse
import csv
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

TRACKING = Path(__file__).resolve().parent.parent / "tracking.csv"
FIELDS = ["quote_number", "date", "client", "contact", "email", "phone",
          "family", "service_id", "service_name", "amount", "amount_label",
          "status", "sent_at", "valid_until", "follow_up_at", "notes"]
OPEN_STATUSES = {"טיוטה", "נשלחה", "בבדיקה"}
CLOSED_STATUSES = {"אושרה", "נדחתה", "פג תוקף"}


def read_rows():
    if not TRACKING.exists():
        return []
    with TRACKING.open(encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def write_rows(rows):
    TRACKING.parent.mkdir(parents=True, exist_ok=True)
    with TRACKING.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in FIELDS})


def expire(rows):
    """הצעה שעבר תוקפה ועדיין פתוחה - מסומנת אוטומטית, כדי שהמעקב לא ישקר."""
    today = date.today().isoformat()
    for row in rows:
        if row.get("status") in OPEN_STATUSES and row.get("valid_until", "") and \
                row["valid_until"] < today:
            row["status"] = "פג תוקף"
    return rows


def cmd_add(args):
    data = json.loads(Path(args.from_build).read_text(encoding="utf-8"))
    rows = read_rows()
    if any(r["quote_number"] == data["quote_number"] for r in rows):
        sys.exit(f"ההצעה {data['quote_number']} כבר רשומה במעקב.")
    follow_up = args.follow_up
    if not follow_up and args.status == "נשלחה":
        follow_up = (date.today() + timedelta(days=args.follow_up_days)).isoformat()
    rows.append({
        "quote_number": data["quote_number"], "date": data["date"],
        "client": data.get("client", ""), "contact": args.contact or "",
        "email": data.get("client_email", ""), "phone": args.phone or "",
        "family": data.get("family", ""), "service_id": data.get("service_id", ""),
        "service_name": data.get("service_name", ""),
        "amount": data.get("amount") or "", "amount_label": data.get("amount_label", ""),
        "status": args.status,
        "sent_at": date.today().isoformat() if args.status == "נשלחה" else "",
        "valid_until": data.get("valid_until", ""),
        "follow_up_at": follow_up or "", "notes": args.note or "",
    })
    write_rows(rows)
    print(f"נרשם למעקב: {data['quote_number']} · {args.status}"
          + (f" · מעקב ב-{follow_up}" if follow_up else ""))


def cmd_update(args):
    rows = read_rows()
    row = next((r for r in rows if r["quote_number"] == args.quote_number), None)
    if not row:
        sys.exit(f"לא נמצאה הצעה {args.quote_number} במעקב.")
    if args.status:
        row["status"] = args.status
        if args.status == "נשלחה" and not row.get("sent_at"):
            row["sent_at"] = date.today().isoformat()
        if args.status in CLOSED_STATUSES:
            row["follow_up_at"] = ""
    if args.follow_up:
        row["follow_up_at"] = args.follow_up
    if args.note:
        row["notes"] = (row.get("notes", "") + " | " + args.note).strip(" |")
    write_rows(rows)
    print(f"עודכן: {args.quote_number} · {row['status']}")


def show(rows):
    if not rows:
        print("אין הצעות להצגה.")
        return
    for r in rows:
        line = (f"{r['quote_number']}  {r['date']}  {r['client']}  "
                f"{r['service_name']}  {r['amount_label']}  [{r['status']}]")
        if r.get("follow_up_at"):
            line += f"  מעקב: {r['follow_up_at']}"
        print(line)


def cmd_list(args):
    rows = expire(read_rows())
    write_rows(rows)
    if args.status:
        rows = [r for r in rows if r["status"] == args.status]
    if args.open:
        rows = [r for r in rows if r["status"] in OPEN_STATUSES]
    show(rows)


def cmd_due(args):
    rows = expire(read_rows())
    write_rows(rows)
    today = date.today().isoformat()
    due = [r for r in rows if r["status"] in OPEN_STATUSES
           and r.get("follow_up_at") and r["follow_up_at"] <= today]
    show(due)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    a = sub.add_parser("add")
    a.add_argument("--from-build", required=True)
    a.add_argument("--status", default="טיוטה")
    a.add_argument("--contact"); a.add_argument("--phone")
    a.add_argument("--note"); a.add_argument("--follow-up")
    a.add_argument("--follow-up-days", type=int, default=4)
    a.set_defaults(func=cmd_add)

    u = sub.add_parser("update")
    u.add_argument("quote_number")
    u.add_argument("--status", choices=sorted(OPEN_STATUSES | CLOSED_STATUSES))
    u.add_argument("--follow-up"); u.add_argument("--note")
    u.set_defaults(func=cmd_update)

    l = sub.add_parser("list")
    l.add_argument("--status"); l.add_argument("--open", action="store_true")
    l.set_defaults(func=cmd_list)

    sub.add_parser("due").set_defaults(func=cmd_due)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
