import { PenLine, Reply } from "lucide-react";
import { MockCaption, MockPill, MockRow, MockStars, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

type Props = { business: string; reviewer: string; review: string; draft: string };

/** Healthcare reply flow: automatic replies off, a neutral draft waiting for a person to approve it. */
export function IndustryReviewedDraftsVisual({ business, reviewer, review, draft }: Props) {
  return (
    <div className="mk-stack">
      <MockRow
        icon={Reply}
        title="Automatic Google replies"
        meta="Off · every reply needs approval"
        trailing={<MockPill>Off</MockPill>}
      />
      <MockWindow title={`Reviews · ${business}`}>
        <div className="vz-air-review-head">
          <span className="vz-air-avatar">{reviewer.charAt(0)}</span>
          <div><b>{reviewer}</b><small>Google · today</small></div>
          <MockStars value={2} size={12} />
        </div>
        <p>{review}</p>
        <span className="mk-label"><PenLine size={11} /> Draft · waiting for approval</span>
        <div className="mk-bubble mk-bubble-brand">{draft}</div>
        <div className="vz-air-actions">
          <span className="mk-button mk-button-ghost">Edit</span>
          <span className="mk-button">Approve and post</span>
        </div>
      </MockWindow>
      <MockCaption>Nothing posts until a team member approves it. Fictional practice.</MockCaption>
    </div>
  );
}
