"use client";

import { useId, useState } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { ReviewCardHeader } from "@/components/reviews/review-card-header";
import { ReviewCardBody } from "@/components/reviews/review-card-body";
import type { ReviewCardTone } from "@/components/reviews/review-card-types";
import { EXAMPLE_REPLIES, EXAMPLE_REVIEW } from "@/components/marketing/product-tour/sample-data";

export function ReviewDemo() {
  const replyId = useId();
  const [tone, setTone] = useState<ReviewCardTone>("friendly");
  const [reply, setReply] = useState(EXAMPLE_REPLIES.friendly);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="review-demo">
      <div className="tour-page-heading">
        <div>
          <span className="tour-overline">YOUR REPUTATION, IN ONE PLACE</span>
          <h2>Review inbox</h2>
        </div>
        <span className="tour-live-label">Interactive example</span>
      </div>
      <div className="tour-review-card">
        <ReviewCardHeader review={{ ...EXAMPLE_REVIEW, response_status: saved ? "responded" : "pending" }} isSelected={false} />
        <ReviewCardBody
          review={EXAMPLE_REVIEW}
          isExpanded={expanded}
          onToggleExpanded={() => setExpanded(!expanded)}
          onPhotoClick={() => {}}
        />
      </div>
      <div className="tour-composer">
        <div className="tour-composer-top">
          <span>
            <Sparkles size={15} aria-hidden="true" /> A reply that sounds like you
          </span>
          <div className="tour-tones" aria-label="Example reply tone">
            {(["friendly", "professional", "concise"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={tone === value}
                onClick={() => {
                  setTone(value);
                  setReply(EXAMPLE_REPLIES[value]);
                  setSaved(false);
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <label htmlFor={replyId} className="sr-only">
          Edit the example reply
        </label>
        <textarea
          id={replyId}
          value={reply}
          onChange={(e) => {
            setReply(e.target.value);
            setSaved(false);
          }}
          rows={3}
        />
        <div className="tour-composer-bottom">
          <p role="status">{saved ? "Example saved. Nothing was published." : "Try a tone. Make it your own."}</p>
          <button type="button" className="tour-action" disabled={!reply.trim()} onClick={() => setSaved(!saved)}>
            {saved ? (
              <>
                <RotateCcw size={14} /> Try again
              </>
            ) : (
              <>
                Preview reply <Check size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
