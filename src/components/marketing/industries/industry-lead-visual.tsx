import { AiRepliesAttentionVisual, AiRepliesHeroVisual } from "@/components/marketing/feature-landing/visuals/ai-replies-visuals";
import { QrCodeHeroVisual } from "@/components/marketing/feature-landing/visuals/qr-code-reviews-visuals";
import { CampaignsTemplatesVisual } from "@/components/marketing/feature-landing/visuals/review-campaigns-visuals";
import { ReviewCollectionTriggersVisual } from "@/components/marketing/feature-landing/visuals/review-collection-visuals";
import { IndustryAutoReplyVisual } from "@/components/marketing/industries/industry-auto-reply-visual";
import { IndustryJobWebhookVisual } from "@/components/marketing/industries/industry-job-webhook-visual";
import { IndustryReviewedDraftsVisual } from "@/components/marketing/industries/industry-reviewed-drafts-visual";
import type { IndustryVisual } from "@/lib/industries/industry-page-content";

/** Picks the product mock for an industry page's lead solution. */
export function IndustryLeadVisual({ visual }: { visual: IndustryVisual }) {
  switch (visual.kind) {
    case "qr-poster":
      return <QrCodeHeroVisual />;
    case "attention-drafts":
      return <AiRepliesAttentionVisual />;
    case "tone-drafts":
      return <AiRepliesHeroVisual />;
    case "request-triggers":
      return <ReviewCollectionTriggersVisual />;
    case "auto-reply":
      return <IndustryAutoReplyVisual />;
    case "campaign-templates":
      return <CampaignsTemplatesVisual />;
    case "reviewed-drafts":
      return <IndustryReviewedDraftsVisual business={visual.business} reviewer={visual.reviewer} review={visual.review} draft={visual.draft} />;
    case "job-webhook":
      return <IndustryJobWebhookVisual business={visual.business} job={visual.job} customer={visual.customer} />;
  }
}
