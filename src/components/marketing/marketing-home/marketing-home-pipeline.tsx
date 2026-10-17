import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Send, ShoppingBag, Sparkles, Star } from "lucide-react";
import { InViewPlay } from "@/components/marketing/in-view-play";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

const STAGES = [
  { title: "Visit ends", meta: "Square checkout, 2:14 pm", icon: <ShoppingBag size={18} /> },
  { title: "Request sent", meta: "Text to Jordan, 2:16 pm", icon: <Send size={18} /> },
  { title: "Review drafted", meta: "5 stars on your review page", icon: <Star size={18} /> },
  {
    title: "Posted on Google",
    meta: "Jordan's review is live",
    icon: <Image src={getBrandLogoUrl("google.com")} alt="" width={18} height={18} unoptimized />,
  },
  { title: "Reply published", meta: "Friendly tone, automatically", icon: <Sparkles size={18} /> },
];

/** A pulse travels the pipeline and lights each stage as it arrives. Paused offscreen; static with reduced motion. */
export function MarketingHomePipeline() {
  return (
    <section className="marketing-section home-pipeline" aria-labelledby="home-pipeline-heading">
      <div className="marketing-container">
        <div className="home-pipeline-head">
          <div>
            <p className="marketing-eyebrow">Automation</p>
            <h2 id="home-pipeline-heading">Set it up once. It runs after every visit.</h2>
          </div>
          <div>
            <p className="home-section-lede">
              Connect Square or send a webhook when a job is done. Zyene times the request, drafts the review and
              answers it, while you run your business.
            </p>
            <Link href="/integrations" className="home-text-link">
              See integrations <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <InViewPlay className="pipe" threshold={0.4}>
          <div className="pipe-line" aria-hidden="true">
            <span className="pipe-trail-clip"><span className="pipe-track pipe-trail" /></span>
            <span className="pipe-runner"><span className="pipe-track"><i className="pipe-dot" /></span></span>
          </div>
          <ol className="pipe-stages">
            {STAGES.map(({ title, meta, icon }, index) => (
              <li key={title} className="pipe-stage" style={{ "--i": index } as CSSProperties}>
                <span className="pipe-icon" aria-hidden="true">{icon}</span>
                <strong>{title}</strong>
                <small>{meta}</small>
              </li>
            ))}
          </ol>
          <p className="pipe-note">Example timeline with fictional customer data.</p>
        </InViewPlay>
      </div>
    </section>
  );
}
