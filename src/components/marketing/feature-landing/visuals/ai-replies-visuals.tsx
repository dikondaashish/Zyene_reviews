import { AlertTriangle, RefreshCw, Send, Sparkles } from "lucide-react";
import { MockCaption, MockPill, MockStars, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const TONES = ["Professional", "Friendly", "Concise"];

/** A review above a fanned deck of tone drafts, with the Friendly draft on top. */
export function AiRepliesHeroVisual() {
  return (
    <div className="vz-air-hero">
      <div className="vz-air-review">
        <div className="vz-air-review-head">
          <span className="vz-air-avatar">P</span>
          <div><b>Priya S.</b><small>Google · 2 hours ago</small></div>
          <MockStars value={4} size={13} />
        </div>
        <p>Maya did a great job on my color. It took a bit longer than booked, but I love how it turned out.</p>
      </div>
      <div className="vz-air-deck">
        <div className="vz-air-card vz-air-back2"><span>Concise</span></div>
        <div className="vz-air-card vz-air-back1"><span>Professional</span></div>
        <div className="vz-air-card vz-air-front">
          <div className="vz-air-tones">
            <Sparkles size={13} />
            {TONES.map((tone) => (
              <span key={tone} className={tone === "Friendly" ? "is-active" : undefined}>{tone}</span>
            ))}
          </div>
          <div className="vz-air-draft">
            Thank you so much, Priya! Maya will be thrilled to hear you love your new color. Sorry it ran a little
            long, and we’ll keep a closer eye on timing next visit. See you soon!
            <span className="vz-air-writing"><i />Writing</span>
          </div>
          <div className="vz-air-actions">
            <span className="mk-button mk-button-ghost">Cancel</span>
            <span className="mk-button">Post reply</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dashboard “Needs your attention” list with a draft in progress. */
export function AiRepliesAttentionVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Dashboard · Northside Auto">
        <div className="vz-air-attn-head">
          <span className="vz-air-attn-icon"><AlertTriangle size={14} /></span>
          <div><b>Needs your attention</b><small>2 urgent reviews - we can draft responses for you</small></div>
        </div>
        <div className="vz-air-attn-item">
          <div className="vz-air-review-head">
            <span className="vz-air-avatar">D</span>
            <div><b>Derek M.</b><small>Google · this morning</small></div>
            <MockPill tone="caution">Urgency 8</MockPill>
          </div>
          <MockStars value={1} size={12} />
          <p>Quoted one price, charged another. Nobody called to explain the extra parts.</p>
          <span className="mk-label">Your reply as owner</span>
          <div className="mk-bubble mk-bubble-brand">
            Derek, I’m sorry about the surprise on your bill. You should have had a call before any extra parts
            were added. Please ask for me at the front desk so I can go through the invoice with you.
          </div>
          <div className="vz-air-attn-tools">
            <span><RefreshCw size={12} />Regenerate</span>
            <span>Adjust tone ▾</span>
            <span className="mk-button"><Send size={13} />Send reply</span>
          </div>
        </div>
        <div className="mk-row">
          <span className="vz-air-avatar">L</span>
          <div className="mk-row-text"><b>Lena O.</b><small>2★ · “Car wasn’t ready when promised…”</small></div>
          <MockPill tone="caution">Urgency 7</MockPill>
        </div>
      </MockWindow>
      <MockCaption>Urgency scores come from AI review analysis.</MockCaption>
    </div>
  );
}

const QUESTIONS = [
  { q: "Do you see patients on Saturdays?", status: "Needs answer" },
  { q: "Is there parking nearby?", status: "Answered" },
  { q: "Do you offer payment plans?", status: "Answered" },
];

/** Google Q&A list with the answer dialog open on top. */
export function AiRepliesQaVisual() {
  return (
    <div className="mk-stack">
      <div className="vz-air-qa">
        <MockWindow title="Google Q&A · Bright Smile Dental">
          {QUESTIONS.map(({ q, status }) => (
            <div key={q} className="vz-air-qa-row">
              <span>{q}</span>
              <MockPill tone={status === "Answered" ? "neutral" : "caution"}>{status}</MockPill>
            </div>
          ))}
        </MockWindow>
        <div className="vz-air-dialog">
          <b>Answer on Google</b>
          <blockquote>Do you see patients on Saturdays?</blockquote>
          <div className="mk-bubble">
            Yes, we’re open Saturday mornings for cleanings and checkups. Give us a call to book a time.
          </div>
          <div className="vz-air-actions">
            <span className="mk-button mk-button-ghost"><Sparkles size={13} />Suggest with AI</span>
            <span className="mk-button">Post to Google</span>
          </div>
        </div>
      </div>
      <MockCaption>Q&amp;A appears only when Google provides it for your listing.</MockCaption>
    </div>
  );
}
