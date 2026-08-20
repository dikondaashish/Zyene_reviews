export const REVIEW_MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500] as const;

export function isReviewMilestone(value: unknown): value is (typeof REVIEW_MILESTONES)[number] {
  return typeof value === "number" && REVIEW_MILESTONES.some((milestone) => milestone === value);
}
