import { redirect } from "next/navigation";

import { isSignedIn } from "@/lib/crm/auth";
import { crmConfigured, listActivities, listLeads, missingDbEnv, schemaReady } from "@/lib/crm/db";
import { computeStats } from "@/lib/crm/stats";
import { groupIntoContacts } from "@/lib/crm/contacts";
import { Workspace } from "@/components/crm/workspace";
import { CrmSetup } from "@/components/crm/setup";

/**
 * The board. Loads every lead in one query and hands the whole set to the
 * client, which filters and sorts locally — a lead list of this size fits in
 * memory, and it keeps the board instant.
 *
 * The session check here is the real one: proxy.ts only redirects, and a
 * forged cookie gets past it but not past isSignedIn().
 */

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  if (!(await isSignedIn())) redirect("/crm/login");

  if (!crmConfigured()) {
    return <CrmSetup reason="env" missing={missingDbEnv()} />;
  }

  const schema = await schemaReady();
  if (!schema.ready) {
    return <CrmSetup reason="schema" detail={schema.reason} />;
  }

  const { archived } = await searchParams;
  const showArchived = archived === "1";

  const leads = await listLeads({ includeArchived: showArchived });
  const activities = await listActivities(leads.map((lead) => lead.id));
  // One card per person: repeat enquiries from the same phone or email fold
  // into a single contact, while every row stays untouched in the table.
  const contacts = groupIntoContacts(leads);
  const stats = computeStats(contacts);

  return (
    <Workspace
      contacts={contacts}
      activities={activities}
      stats={stats}
      showArchived={showArchived}
    />
  );
}
