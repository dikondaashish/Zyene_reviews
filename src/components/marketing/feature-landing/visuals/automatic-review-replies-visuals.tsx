import { CircleCheck, CircleMinus, Reply, Star } from "lucide-react";
import type { PillTone } from "@/components/marketing/feature-landing/visuals/mock-primitives";
import { MockPill, MockRow, MockStars, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const CHECKS = ["Google review", "No reply yet", "5★ meets 4 stars and up", "Posted after you turned it on"];

/** A new review travelling through the eligibility checks to a posted reply. */
export function AutoRepliesHeroVisual() {
  return (
    <div className="vz-auto-hero">
      <div className="vz-auto-switch">
        <span className="vz-auto-switch-icon"><Reply size={16} /></span>
        <div>
          <b>Automatic replies <MockPill tone="positive">On</MockPill></b>
          <small>Google · 4 stars and up · Friendly tone</small>
        </div>
        <span className="vz-auto-toggle" />
      </div>
      <div className="vz-auto-pipe">
        <div className="vz-auto-node">
          <span className="mk-label">New review · 9:42 am</span>
          <div className="vz-auto-node-head"><b>Tom H.</b><MockStars value={5} size={12} /></div>
          <p>Fixed my brakes the same day and explained everything before starting.</p>
        </div>
        <ul className="vz-auto-checks">
          {CHECKS.map((check) => (
            <li key={check}><CircleCheck size={14} />{check}</li>
          ))}
        </ul>
        <div className="vz-auto-node vz-auto-done">
          <span className="mk-label">Reply posted · 9:43 am</span>
          <p>Thanks so much, Tom! We’re glad we could get you back on the road the same day. See you next service!</p>
          <MockPill tone="brand">AI auto commenter · Zyene Reviews</MockPill>
        </div>
      </div>
    </div>
  );
}

/** The confirmation dialog shown before automatic publishing starts. */
export function AutoRepliesConfirmVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-auto-backdrop">
        <div className="vz-auto-modal">
          <b>Turn on automatic Google replies?</b>
          <p>
            AI replies will be published publicly for the business selected in the header. You will not review each
            reply before it is posted.
          </p>
          <dl>
            <dt>Applies to</dt><dd>New, unanswered reviews</dd>
            <dt>Rating</dt><dd>4 stars and up</dd>
            <dt>Tone</dt><dd>Friendly</dd>
          </dl>
          <small>Example reply · actual replies vary</small>
          <blockquote>Thank you for the lovely feedback! We’re so glad you enjoyed your visit and hope to see you again soon.</blockquote>
          <small>Existing reviews are not included. Turn this off at any time to stop future automatic replies.</small>
          <div className="vz-auto-modal-actions">
            <span className="mk-button mk-button-ghost">Keep off</span>
            <span className="mk-button">Enable automatic publishing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const INCOMING: { title: string; meta: string; rating: number; outcome: string; tone: PillTone; replied: boolean }[] = [
  { title: "Ava L.", meta: "Google · new", rating: 5, outcome: "Auto reply posted", tone: "positive", replied: true },
  { title: "Ben R.", meta: "Google · new", rating: 4, outcome: "Auto reply posted", tone: "positive", replied: true },
  { title: "Carla D.", meta: "Google · new", rating: 2, outcome: "Left for you", tone: "caution", replied: false },
  { title: "Dev P.", meta: "Google · already answered", rating: 5, outcome: "Skipped", tone: "neutral", replied: false },
  { title: "Erin S.", meta: "Yelp · new", rating: 5, outcome: "Not Google", tone: "neutral", replied: false },
];

/** Which new reviews the 4-stars-and-up rule answers and which it leaves alone. */
export function AutoRepliesEligibilityVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="New reviews · Northside Auto">
        <div className="vz-auto-rule"><Star size={13} />Rule: 4 stars and up · Friendly</div>
        {INCOMING.map((r) => (
          <MockRow
            key={r.title}
            icon={r.replied ? CircleCheck : CircleMinus}
            title={`${r.title} · ${r.rating}★`}
            meta={r.meta}
            trailing={<MockPill tone={r.tone}>{r.outcome}</MockPill>}
          />
        ))}
      </MockWindow>
    </div>
  );
}
