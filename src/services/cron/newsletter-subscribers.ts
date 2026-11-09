import type { SupabaseClient } from "@supabase/supabase-js";

export type NewsletterSubscriber = { id: string; email: string };

/** PostgREST caps each response at 1000 rows by default; page at that size. */
export const NEWSLETTER_SUBSCRIBER_PAGE_SIZE = 1000;

/**
 * Loads every active (not unsubscribed) newsletter subscriber, paging with a
 * stable `id` order so no subscriber past the first 1000 rows is skipped.
 */
export async function loadActiveNewsletterSubscribers(
  admin: SupabaseClient,
  pageSize = NEWSLETTER_SUBSCRIBER_PAGE_SIZE,
): Promise<NewsletterSubscriber[]> {
  const subscribers: NewsletterSubscriber[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from("marketing_subscribers")
      .select("id, email")
      .is("unsubscribed_at", null)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error("Unable to load newsletter subscribers");
    const page = (data ?? []) as NewsletterSubscriber[];
    subscribers.push(...page);
    if (page.length < pageSize) return subscribers;
  }
}
