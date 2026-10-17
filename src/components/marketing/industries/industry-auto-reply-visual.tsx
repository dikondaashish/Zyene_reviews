import { Sparkles, Star } from "lucide-react";

const TONES = ["Professional", "Friendly", "Concise"];

/** A static slice of the automatic-reply settings. Decorative: the card copy carries the meaning. */
export function IndustryAutoReplyVisual() {
  return (
    <div className="ind-reply-ui" aria-hidden="true">
      <div className="ind-reply-row">
        <span className="ind-reply-title"><Sparkles size={14} /> Automatic Google replies</span>
        <span className="ind-reply-toggle"><i /></span>
      </div>
      <div className="ind-reply-field">
        <small>Tone</small>
        <div className="bento-segment">
          {TONES.map((tone) => (
            <span key={tone} className={tone === "Friendly" ? "is-active" : undefined}>{tone}</span>
          ))}
        </div>
      </div>
      <div className="ind-reply-field">
        <small>Reply automatically to</small>
        <p className="ind-reply-stars">
          {[0, 1, 2, 3].map((i) => <Star key={i} size={13} fill="currentColor" />)}
          <span>4 stars and up</span>
        </p>
      </div>
      <p className="ind-reply-note">Lower ratings wait in your inbox for a personal reply.</p>
    </div>
  );
}
