import { ArrowDown, CircleCheck, MessageSquare, Webhook } from "lucide-react";
import { MockCaption, MockPill, MockRow, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

type Props = { business: string; job: string; customer: string };

/** Trades flow: a job marked complete fires a webhook, and Zyene texts the review request. */
export function IndustryJobWebhookVisual({ business, job, customer }: Props) {
  const firstName = customer.split(" ")[0];
  const link = `collectratings.com/${business.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`;
  return (
    <div className="mk-stack">
      <MockWindow title="Your job software">
        <MockRow icon={CircleCheck} title={job} meta={`${customer} · marked complete 2:14 pm`} trailing={<MockPill tone="positive">Complete</MockPill>} />
      </MockWindow>
      <span className="vz-rc-arrow"><ArrowDown size={16} /></span>
      <MockRow icon={Webhook} title="Webhook received by Zyene" meta="POST /api/webhooks/generic" trailing={<MockPill tone="brand">Zapier</MockPill>} />
      <span className="vz-rc-arrow"><ArrowDown size={16} /></span>
      <MockRow icon={MessageSquare} title={`SMS to ${customer}`} meta="Sent 2:15 pm" trailing={<MockPill tone="positive">Delivered</MockPill>} />
      <div className="mk-bubble">
        Hi {firstName}, thanks for choosing {business}. We&apos;d love your feedback: {link}
      </div>
      <MockCaption>Zyene has no native field-service connector; the webhook does the hand-off. Fictional company.</MockCaption>
    </div>
  );
}
