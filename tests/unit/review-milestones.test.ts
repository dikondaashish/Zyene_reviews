import { describe, expect, it } from "vitest";

import {
  REVIEW_MILESTONES,
  isReviewMilestone,
} from "@/lib/milestones/review-milestones";

describe("review milestone contract", () => {
  it("recognizes only configured review milestones", () => {
    expect(REVIEW_MILESTONES).toEqual([10, 25, 50, 100, 250, 500, 1000, 2500]);
    expect(isReviewMilestone(50)).toBe(true);
    expect(isReviewMilestone(1380)).toBe(false);
    expect(isReviewMilestone(null)).toBe(false);
  });
});
