import {
  Activity,
  Bot,
  Check,
  GitBranch,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";

function FeatureLabel({ children }: { children: ReactNode }) {
  return <span className="home-feature-card-label">{children}</span>;
}

function MiniMetric({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="home-feature-mini-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </div>
  );
}

export function MarketingHomeFeatureConstellation() {
  return (
    <section className="marketing-section home-feature-constellation" aria-labelledby="home-feature-heading">
      <div className="home-feature-shell">
        <div className="home-feature-glow home-feature-glow-one" aria-hidden="true" />
        <div className="home-feature-glow home-feature-glow-two" aria-hidden="true" />
        <div className="home-feature-heading">
          <FeatureLabel><Zap size={14} aria-hidden="true" /> POWERFUL FEATURES</FeatureLabel>
          <h2 id="home-feature-heading">A reputation routine that keeps working.</h2>
          <p>One calm workspace for collecting feedback, replying with care, and seeing what to improve next.</p>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card home-feature-card-campaign">
            <div className="home-feature-card-title"><Send size={18} aria-hidden="true" /><h3>Review request campaigns</h3></div>
            <p>Reach customers by text or email at the moment their experience is fresh.</p>
            <div className="home-feature-variant-grid" aria-label="Campaign channel comparison">
              <div className="home-feature-variant"><span>SMS</span><strong>32%</strong><div className="home-feature-bar"><i className="is-wide" /></div><small>response rate</small></div>
              <div className="home-feature-variant"><span>Email</span><strong>24%</strong><div className="home-feature-bar"><i className="is-medium" /></div><small>response rate</small></div>
            </div>
            <div className="home-feature-callout"><TrendingUp size={15} aria-hidden="true" /><strong>+28%</strong><span>more reviews this month</span></div>
          </article>

          <article className="home-feature-card home-feature-card-flow">
            <div className="home-feature-card-title"><GitBranch size={18} aria-hidden="true" /><h3>Smart review routing</h3></div>
            <p>Guide every response to the right place without losing the human touch.</p>
            <div className="home-feature-flow" aria-label="Review routing flow">
              <div className="home-feature-flow-line" aria-hidden="true" />
              <div className="home-feature-flow-step"><span><Check size={13} aria-hidden="true" /></span><div><strong>Completed visit</strong><small>Trigger a request</small></div></div>
              <div className="home-feature-flow-step"><span><Star size={13} aria-hidden="true" /></span><div><strong>Happy customer</strong><small>Invite a public review</small></div></div>
              <div className="home-feature-flow-step"><span><ShieldCheck size={13} aria-hidden="true" /></span><div><strong>Needs attention</strong><small>Follow up privately</small></div></div>
            </div>
          </article>

          <article className="home-feature-card home-feature-card-ai">
            <div className="home-feature-card-title"><Bot size={18} aria-hidden="true" /><h3>Automatic Google replies</h3></div>
            <p>Your next Google reply, taken care of. Choose eligible star ratings and a tone that sounds like your business.</p>
            <div className="home-feature-conversation">
              <div className="home-feature-message home-feature-message-customer"><MessageSquareText size={14} aria-hidden="true" /><span>“Amazing service. We’ll be back.”</span></div>
              <div className="home-feature-message home-feature-message-ai"><Sparkles size={14} aria-hidden="true" /><span>New review → AI reply → Published</span><small>Example · Automatic mode</small></div>
            </div>
            <Link href="/features/ai-replies#automatic-replies-heading" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">See automatic replies in action →</Link>
          </article>

          <article className="home-feature-card home-feature-card-analytics">
            <div className="home-feature-card-title"><Activity size={18} aria-hidden="true" /><h3>Reputation analytics</h3></div>
            <div className="home-feature-metrics"><MiniMetric label="Average rating" value="4.8" trend="+12%" /><MiniMetric label="Total reviews" value="248" trend="+28%" /></div>
            <div className="home-feature-chart" role="img" aria-label="Reviews trend rising over the last 30 days"><i className="chart-bar-one" /><i className="chart-bar-two" /><i className="chart-bar-three" /><i className="chart-bar-four" /><i className="chart-dot" /></div>
          </article>

          <article className="home-feature-card home-feature-card-widget">
            <div className="home-feature-card-title"><ShieldCheck size={18} aria-hidden="true" /><h3>Review widgets</h3></div>
            <p>Put your best feedback where new customers are already deciding.</p>
            <div className="home-feature-score" aria-label="4.8 out of 5 average rating"><div><strong>4.8</strong><span>/5 avg</span></div></div>
            <div className="home-feature-widget-quote"><Star size={13} fill="currentColor" aria-hidden="true" /><span>“Would recommend”</span><small>Verified customer</small></div>
          </article>
        </div>
      </div>
    </section>
  );
}
