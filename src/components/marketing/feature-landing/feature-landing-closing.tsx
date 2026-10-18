import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";

type ClosingProps = { title: string; text?: string; location: string };

/** Closing band shared by /features and every feature page. */
export function FeatureLandingClosing({ title, text = "Try Zyene free for 7 days. Plans start at $29.99 a month.", location }: ClosingProps) {
  return (
    <MarketingClosingBand
      title={title}
      text={text}
      primaryLabel="Start 7-day free trial"
      secondary={{ label: "See pricing", href: "/pricing" }}
      trackLocation={location}
      headingId="fl-final-heading"
    />
  );
}
