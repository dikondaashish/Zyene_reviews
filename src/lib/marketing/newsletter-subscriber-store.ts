import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Data access for `marketing_subscribers` double opt-in. `confirmed_at` and
 * `confirmation_token` are newer than the generated database types, so the
 * casts live here instead of at every call site.
 */
export type SubscriberRow = {
    id: string;
    email: string;
    source: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    subscribed_at: string;
    unsubscribed_at: string | null;
    confirmed_at: string | null;
    confirmation_token: string;
    confirmation_sent_at: string | null;
};

export type SubscriberSignup = {
    email: string;
    source: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
};

type Db = SupabaseClient;
type RowResult = { data: SubscriberRow | null; error: { code?: string; message?: string } | null };

const COLUMNS =
    "id, email, source, utm_source, utm_medium, utm_campaign, subscribed_at, unsubscribed_at, confirmed_at, confirmation_token, confirmation_sent_at";

const table = (db: Db) => db.from("marketing_subscribers");

function unwrap(result: RowResult, action: string): SubscriberRow | null {
    if (result.error) throw new Error(`Unable to ${action} newsletter subscriber`);
    return result.data;
}

export async function findSubscriberByEmail(db: Db, email: string): Promise<SubscriberRow | null> {
    const result = (await table(db).select(COLUMNS).eq("email", email).maybeSingle()) as unknown as RowResult;
    return unwrap(result, "load");
}

export async function findSubscriberByToken(db: Db, token: string): Promise<SubscriberRow | null> {
    const result = (await table(db).select(COLUMNS).eq("confirmation_token", token).maybeSingle()) as unknown as RowResult;
    return unwrap(result, "load");
}

/** New pending sign-up; returns null when another request created the row first. */
export async function insertPendingSubscriber(db: Db, signup: SubscriberSignup): Promise<SubscriberRow | null> {
    const result = (await table(db)
        .insert({ ...signup, confirmed_at: null, confirmation_sent_at: new Date().toISOString() } as never)
        .select(COLUMNS)
        .single()) as unknown as RowResult;
    if (result.error?.code === "23505") return null;
    return unwrap(result, "create");
}

/** Returns an unsubscribed address to pending with a fresh token; it needs confirming again. */
export async function resetSubscriberToPending(db: Db, id: string, signup: SubscriberSignup): Promise<SubscriberRow> {
    const result = (await table(db)
        .update({
            ...signup,
            unsubscribed_at: null,
            confirmed_at: null,
            confirmation_token: crypto.randomUUID(),
            subscribed_at: new Date().toISOString(),
            confirmation_sent_at: new Date().toISOString(),
        } as never)
        .eq("id", id)
        .select(COLUMNS)
        .single()) as unknown as RowResult;
    const row = unwrap(result, "reset");
    if (!row) throw new Error("Unable to reset newsletter subscriber");
    return row;
}

/**
 * Claims the right to send another confirmation email to a pending sign-up when none
 * was sent since `cutoff`. Only one concurrent caller gets the row back.
 */
export async function claimConfirmationResend(db: Db, id: string, cutoff: string): Promise<SubscriberRow | null> {
    const result = (await table(db)
        .update({ confirmation_sent_at: new Date().toISOString() } as never)
        .eq("id", id)
        .is("confirmed_at" as never, null)
        .is("unsubscribed_at", null)
        .or(`confirmation_sent_at.is.null,confirmation_sent_at.lt."${cutoff}"`)
        .select(COLUMNS)
        .maybeSingle()) as unknown as RowResult;
    return unwrap(result, "update");
}

/** Confirms a pending, still-subscribed sign-up. Only one concurrent caller gets the row back. */
export async function confirmSubscriberByToken(db: Db, token: string): Promise<SubscriberRow | null> {
    const result = (await table(db)
        .update({ confirmed_at: new Date().toISOString() } as never)
        .eq("confirmation_token", token)
        .is("confirmed_at" as never, null)
        .is("unsubscribed_at", null)
        .select(COLUMNS)
        .maybeSingle()) as unknown as RowResult;
    return unwrap(result, "confirm");
}
