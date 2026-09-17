import type { DemoAutoRating, DemoTone } from "@/types/marketing-product-demo";

/** Fictional new Google reviews, separate from the existing demo inbox. */
export const AUTO_REPLY_SAMPLES: Record<DemoAutoRating, { review: string; replies: Record<DemoTone, string> }> = {
  3: {
    review: "Lovely coffee, but our order took longer than expected. A heads-up about the wait would have helped.",
    replies: {
      professional: "Thank you for your review, Taylor. We apologize for the wait and appreciate your feedback. We’ll work on keeping our guests better informed during busy times.",
      friendly: "Thanks for being honest, Taylor! We’re glad you liked the coffee and sorry about the wait. We’ll work on giving you a better heads-up next time.",
      concise: "Thanks, Taylor. We’re sorry about the wait and will work on clearer updates.",
    },
  },
  4: {
    review: "Really enjoyed the coffee and friendly service. I’d love to see more pastry options next time!",
    replies: {
      professional: "Thank you for your review, Taylor. We’re pleased you enjoyed the coffee and service. We appreciate your suggestion about pastries and will share it with our team.",
      friendly: "Thanks, Taylor! So happy you enjoyed your visit. We love the pastry suggestion and will pass it along to our team. Hope to see you soon!",
      concise: "Thanks, Taylor! Glad you enjoyed the coffee. We appreciate your pastry suggestion.",
    },
  },
  5: {
    review: "Wonderful coffee, a welcoming team, and such a cozy space. Already looking forward to my next visit!",
    replies: {
      professional: "Thank you for your review, Taylor. We’re delighted you enjoyed the coffee, service, and atmosphere. We look forward to welcoming you again.",
      friendly: "Taylor, you’ve made our day! We’re so glad you felt at home. Your next cup is waiting whenever you’re ready to visit again!",
      concise: "Thanks, Taylor! We’re glad you loved your visit. See you again soon!",
    },
  },
};
