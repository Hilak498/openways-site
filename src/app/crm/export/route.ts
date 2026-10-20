import { isSignedIn } from "@/lib/crm/auth";
import { crmConfigured, listLeads } from "@/lib/crm/db";
import { leadsToCsv } from "@/lib/crm/csv";

/**
 * CSV download of the whole board (archive included — an export is a backup).
 * Route handlers are reachable directly, so the session check is first.
 */

export async function GET(request: Request) {
  if (!(await isSignedIn())) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!crmConfigured()) {
    return new Response("CRM is not configured", { status: 503 });
  }

  const includeArchived = new URL(request.url).searchParams.get("archived") !== "0";
  const leads = await listLeads({ includeArchived });
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(leadsToCsv(leads), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="openways-leads-${stamp}.csv"`,
      // A lead list must never sit in a shared cache.
      "Cache-Control": "no-store, private",
    },
  });
}
