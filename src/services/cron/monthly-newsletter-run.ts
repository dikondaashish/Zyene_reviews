import type { SupabaseClient } from "@supabase/supabase-js";

import { getMonthlyNewsletterEdition } from "@/lib/campaign-content/monthly-newsletter-content";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import { marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";
import { sendEmail } from "@/services/resend/send-email";
import { monthlyNewsletterEmail } from "@/services/resend/templates/growth-marketing-emails";

type Subscriber = { id: string; email: string };
type Delivery = {
  id: string;
  status: "pending" | "sending" | "sent" | "failed";
  attempt_count: number;
};
type DeliveryDb = SupabaseClient;

/**
 * Sends one edition at most once per subscriber. The durable delivery row and
 * Resend idempotency key cover a process crash between provider acceptance and
 * recording the provider's message ID.
 */
export async function runMonthlyNewsletter(now = new Date()) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("marketing_subscribers")
    .select("id, email")
    .is("unsubscribed_at", null);

  if (error) throw new Error("Unable to load newsletter subscribers");
  const subscribers = (data ?? []) as Subscriber[];
  if (subscribers.length === 0) return { sent: 0, failed: 0, total: 0 };

  const editionKey = now.toISOString().slice(0, 7);
  const edition = getMonthlyNewsletterEdition();
  const monthLabel = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const caseStudyLink = marketingCanonicalUrl(
    `/case-studies/${edition.caseStudySlug}`,
  );
  const outcomes = await Promise.all(
    subscribers.map((subscriber) =>
      deliverMonthlyNewsletter(admin, subscriber, {
        editionKey,
        monthLabel,
        productUpdate: edition.productUpdate,
        tipTitle: edition.tipTitle,
        tipBody: edition.tipBody,
        caseStudyLink,
        caseStudyTitle: edition.caseStudyTitle,
      }),
    ),
  );

  const sent = outcomes.filter((outcome) => outcome === "sent").length;
  const failed = outcomes.filter((outcome) => outcome === "failed").length;
  if (failed > 0) throw new Error("One or more newsletter deliveries failed");
  return { sent, failed, total: subscribers.length };
}

type NewsletterContent = {
  editionKey: string;
  monthLabel: string;
  productUpdate: string;
  tipTitle: string;
  tipBody: string;
  caseStudyLink: string;
  caseStudyTitle: string;
};

async function deliverMonthlyNewsletter(
  admin: DeliveryDb,
  subscriber: Subscriber,
  content: NewsletterContent,
): Promise<"sent" | "skipped" | "failed"> {
  const delivery = await claimNewsletterDelivery(
    admin,
    content.editionKey,
    subscriber.id,
  );
  if (!delivery) return "skipped";

  const unsubscribeUrl = `${marketingCanonicalUrl("/newsletter/unsubscribe")}?id=${subscriber.id}`;
  const { subject, html } = monthlyNewsletterEmail({
    monthLabel: content.monthLabel,
    productUpdate: content.productUpdate,
    tipTitle: content.tipTitle,
    tipBody: content.tipBody,
    caseStudyLink: content.caseStudyLink,
    caseStudyTitle: content.caseStudyTitle,
    unsubscribeUrl,
  });
  const result = await sendEmail({
    to: subscriber.email,
    subject,
    html,
    idempotencyKey: `monthly-newsletter-${content.editionKey}-${subscriber.id}`,
  });

  if (!result.sent) {
    await updateNewsletterDelivery(admin, delivery.id, { status: "failed" });
    logger.error(
      { subscriberId: subscriber.id, editionKey: content.editionKey },
      "Newsletter delivery failed",
    );
    return "failed";
  }

  await updateNewsletterDelivery(admin, delivery.id, {
    status: "sent",
    ...(result.id ? { resend_email_id: result.id } : {}),
  });
  return "sent";
}

async function claimNewsletterDelivery(
  admin: DeliveryDb,
  editionKey: string,
  subscriberId: string,
): Promise<Delivery | null> {
  const insert = (await admin
    .from("marketing_newsletter_deliveries" as never)
    .upsert(
      { edition_key: editionKey, subscriber_id: subscriberId },
      { onConflict: "edition_key,subscriber_id", ignoreDuplicates: true },
    )) as unknown as { error: { message?: string } | null };
  if (insert.error) throw new Error("Unable to create newsletter delivery");

  const selected = (await admin
    .from("marketing_newsletter_deliveries" as never)
    .select("id, status, attempt_count" as never)
    .eq("edition_key" as never, editionKey as never)
    .eq("subscriber_id" as never, subscriberId as never)
    .maybeSingle()) as unknown as {
    data: Delivery | null;
    error: { message?: string } | null;
  };
  if (selected.error || !selected.data)
    throw new Error("Unable to load newsletter delivery");
  if (selected.data.status === "sent") return null;

  const claimed = (await admin
    .from("marketing_newsletter_deliveries" as never)
    .update({
      status: "sending",
      attempt_count: selected.data.attempt_count + 1,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id" as never, selected.data.id as never)
    .neq("status" as never, "sent" as never)
    .select("id, status, attempt_count" as never)
    .maybeSingle()) as unknown as {
    data: Delivery | null;
    error: { message?: string } | null;
  };
  if (claimed.error) throw new Error("Unable to claim newsletter delivery");
  return claimed.data;
}

async function updateNewsletterDelivery(
  admin: DeliveryDb,
  deliveryId: string,
  updates: { status: "sent" | "failed"; resend_email_id?: string },
): Promise<void> {
  const result = (await admin
    .from("marketing_newsletter_deliveries" as never)
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, deliveryId as never)) as unknown as {
    error: { message?: string } | null;
  };
  if (result.error) throw new Error("Unable to update newsletter delivery");
}
