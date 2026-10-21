import type { Lead } from "./types";

/**
 * One person, however many times they enquired.
 *
 * The site keeps writing one row per submission — that is the real record of
 * what was sent, and nothing here changes it. The board, on the other hand,
 * should show a person once. `contact_key` (a DB trigger, see the migration)
 * ties the rows together; this module turns them into cards.
 *
 * The **first** enquiry is the card: it is the row that carries the CRM's own
 * state (stage, owner, follow-up, notes, board position), so that state has a
 * single, stable home no matter how many later enquiries arrive.
 */

export type Contact = {
  key: string;
  /** The row the board edits: earliest enquiry, holder of the CRM state. */
  lead: Lead;
  /** Every enquiry from this person, newest first. Always at least one. */
  enquiries: Lead[];
  enquiryCount: number;
  firstEnquiryAt: string;
  latestEnquiryAt: string;
  /** Distinct services asked about, newest first. */
  services: string[];
  /**
   * The most recently expressed marketing preference — not "any yes".
   * Someone who opted in once and out later has opted out (§30A).
   */
  marketingConsent: boolean;
  /** True once a second enquiry exists, so the card can say so. */
  isReturning: boolean;
};

const byNewest = (a: Lead, b: Lead) => b.createdAt.localeCompare(a.createdAt);

export function groupIntoContacts(leads: Lead[]): Contact[] {
  const buckets = new Map<string, Lead[]>();
  for (const lead of leads) {
    const key = lead.contactKey || lead.id;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(lead);
    else buckets.set(key, [lead]);
  }

  const contacts: Contact[] = [];
  for (const [key, rows] of buckets) {
    const enquiries = [...rows].sort(byNewest);
    const primary = enquiries[enquiries.length - 1];
    const latest = enquiries[0];

    const services: string[] = [];
    for (const enquiry of enquiries) {
      if (enquiry.service && !services.includes(enquiry.service)) {
        services.push(enquiry.service);
      }
    }

    contacts.push({
      key,
      // The newest name/phone/email win: people change numbers, and the
      // latest submission is what they typed most recently.
      lead: {
        ...primary,
        name: latest.name || primary.name,
        phone: latest.phone || primary.phone,
        email: latest.email || primary.email,
      },
      enquiries,
      enquiryCount: enquiries.length,
      firstEnquiryAt: primary.createdAt,
      latestEnquiryAt: latest.createdAt,
      services,
      marketingConsent: latest.marketingConsent,
      isReturning: enquiries.length > 1,
    });
  }

  return contacts;
}

/** Every lead row behind a card — what an archive or delete has to cover. */
export function contactLeadIds(contact: Contact): string[] {
  return contact.enquiries.map((enquiry) => enquiry.id);
}
