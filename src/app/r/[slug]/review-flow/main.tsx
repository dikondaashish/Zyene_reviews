"use client";

import { ReviewFlowStepContent } from "./review-flow-step-content";
import type { PublicReviewFlowProps } from "./types";
import { useReviewFlow } from "./use-review-flow";

export function PublicReviewFlow(props: PublicReviewFlowProps) {
    const flow = useReviewFlow(props);
    return <ReviewFlowStepContent flow={flow} />;
}
