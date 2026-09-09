import type { DemoPlatform, DemoReview } from "@/types/marketing-product-demo";

/** Fictional, local-only examples. No customer records or live service calls. */
export const DEMO_REVIEWS: DemoReview[] = [
  {
    id: "jordan", name: "Jordan M.", initials: "JM", platform: "google", rating: 5, time: "2 hours ago",
    content: "The team made us feel so welcome. Great coffee, a lovely space, and the kind of service that makes you want to come back.",
    replies: {
      friendly: "Jordan, this made our day! We’re so glad you enjoyed the coffee and felt right at home. Can’t wait to welcome you back.",
      professional: "Thank you for your thoughtful review, Jordan. We’re delighted that you enjoyed the coffee, atmosphere, and service. We look forward to welcoming you again.",
      concise: "Thanks, Jordan! We’re glad you enjoyed your visit. Hope to see you again soon.",
    },
  },
  {
    id: "casey", name: "Casey R.", initials: "CR", platform: "google", rating: 3, time: "5 hours ago",
    content: "The coffee was lovely, but we waited quite a while for our order during the morning rush. A little more communication would have helped.",
    replies: {
      friendly: "Thanks for being honest, Casey. We’re happy you enjoyed your coffee, and we’re sorry the wait let you down. We’ll share this with our team and work on keeping everyone updated during the rush.",
      professional: "Thank you for your feedback, Casey. We apologize for the wait and lack of updates. Your comments will help our team improve communication during busy periods. We appreciate the opportunity to do better.",
      concise: "Thanks, Casey. We’re sorry about the wait. We’ll work on clearer updates during busy mornings.",
    },
  },
  {
    id: "alex", name: "Alex T.", initials: "AT", platform: "facebook", rating: 4, time: "Yesterday",
    content: "My new favorite spot to catch up with friends. The oat latte was excellent. I’d love to see a few more dairy-free pastries!",
    replies: {
      friendly: "We’re so glad you found us, Alex! Great coffee and catch-ups are what we’re here for. Thanks for the dairy-free pastry idea. We’ll pass it along to our team.",
      professional: "Thank you, Alex. We’re pleased you enjoyed your latte and time with friends. We appreciate your suggestion about dairy-free pastries and will share it with our team.",
      concise: "Thanks, Alex! Glad you loved the latte. We appreciate the dairy-free pastry suggestion.",
    },
  },
];

export const DEMO_CUSTOMERS = ["Jordan", "Casey", "Alex"] as const;
const COUNTS: Record<DemoPlatform, number[]> = {
  google: [2, 3, 1, 4, 3, 5, 4, 3, 4, 3, 5, 4, 7, 6],
  facebook: [1, 0, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
  yelp: [0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1],
};
export const DEMO_REPORT_DAYS = Array.from({ length: 14 }, (_, index) => ({
  label: `Aug ${index + 1}`,
  platforms: Object.fromEntries(Object.entries(COUNTS).map(([platform, values]) => {
    const count = values[index];
    return [platform, { count, ratingTotal: count * 5 - Math.min(count, index % 3), responded: Math.max(0, count - (index % 4 === 0 ? 1 : 0)) }];
  })) as Record<DemoPlatform, { count: number; ratingTotal: number; responded: number }>,
}));
