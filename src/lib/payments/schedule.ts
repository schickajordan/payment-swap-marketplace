import { createServerSupabaseClient } from "@/lib/supabase/server";

function toUTCDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Add calendar months preserving day-of-month where possible (UTC). */
export function addCalendarMonthsUTC(from: Date, months: number) {
  const day = from.getUTCDate();
  const firstOfTargetMonth = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, 1));
  const daysInMonth = new Date(
    Date.UTC(firstOfTargetMonth.getUTCFullYear(), firstOfTargetMonth.getUTCMonth() + 1, 0)
  ).getUTCDate();
  const clamped = Math.min(day, daysInMonth);
  return new Date(
    Date.UTC(firstOfTargetMonth.getUTCFullYear(), firstOfTargetMonth.getUTCMonth(), clamped)
  );
}

/**
 * Creates monthly scheduled rows after admin/legal signs off (status → signed).
 * Idempotent if rows already exist.
 */
export async function finalizeSignedAgreementWithSchedule(agreementId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: existing, error: existingError } = await supabase
    .from("agreement_payments")
    .select("id")
    .eq("agreement_id", agreementId)
    .limit(1);

  if (existingError) {
    throw new Error(`Failed to check payments: ${existingError.message}`);
  }

  if (existing?.length) {
    return;
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("payment_agreements")
    .select("id, listing_id, monthly_payment_cents")
    .eq("id", agreementId)
    .single();

  if (agreementError || !agreement) {
    throw new Error("Agreement missing for schedule generation.");
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("remaining_term_months, deposit_cents")
    .eq("id", agreement.listing_id)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing missing for schedule generation.");
  }

  const rawTerm = listing.remaining_term_months ?? 12;
  const termMonths = Math.min(Math.max(rawTerm, 1), 120);
  const now = new Date();
  const scheduleStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startStr = toUTCDateISO(scheduleStart);
  const lastDue = addCalendarMonthsUTC(scheduleStart, termMonths - 1);
  const endStr = toUTCDateISO(lastDue);

  const { error: updateAggError } = await supabase
    .from("payment_agreements")
    .update({ start_date: startStr, end_date: endStr })
    .eq("id", agreementId);

  if (updateAggError) {
    throw new Error(`Failed to set agreement dates: ${updateAggError.message}`);
  }

  const depositCents = Math.max(listing.deposit_cents ?? 0, 0);

  const inserts: {
    agreement_id: string;
    due_date: string;
    amount_cents: number;
    status: "scheduled";
    purpose: "deposit" | "installment";
  }[] = [];

  if (depositCents > 0) {
    inserts.push({
      agreement_id: agreementId,
      due_date: startStr,
      amount_cents: depositCents,
      status: "scheduled",
      purpose: "deposit",
    });
  }

  for (let i = 0; i < termMonths; i += 1) {
    inserts.push({
      agreement_id: agreementId,
      due_date: toUTCDateISO(addCalendarMonthsUTC(scheduleStart, i)),
      amount_cents: agreement.monthly_payment_cents,
      status: "scheduled",
      purpose: "installment",
    });
  }

  const { error: insertErr } = await supabase.from("agreement_payments").insert(inserts);

  if (insertErr) {
    throw new Error(`Failed to create payment schedule: ${insertErr.message}`);
  }
}
