// Rule-based review responses for the free tool (no AI key required on marketing site)

export function generatePrimaryReviewResponse(params: {
    rating: number;
    reviewText: string;
    businessName: string;
}): string {
    const { rating, reviewText, businessName } = params;
    const name = businessName.trim() || "our team";
    const stars = Math.min(5, Math.max(1, Math.round(rating)));

    if (stars >= 4) {
        return `Thank you so much for the ${stars}-star review! We're thrilled you had a great experience with ${name}. Your feedback means a lot to our team and helps other customers know what to expect. We hope to see you again soon!`;
    }
    if (stars === 3) {
        return `Thank you for sharing your honest feedback about ${name}. We're glad parts of your visit went well, and we'd love to hear more about how we can earn a 5-star experience next time. Please reach out to us directly — we're committed to improving.`;
    }
    return `We're sorry your experience with ${name} didn't meet your expectations. ${reviewText.trim() ? "We take your comments seriously and want to make this right." : "Your feedback is important to us."} Please contact us so we can address your concerns personally before you update your review.`;
}

export const BONUS_REVIEW_RESPONSE_TEMPLATES = [
    {
        label: "Short & warm (5-star)",
        text: "Thanks for the kind words! Our whole team at {business} appreciates you.",
    },
    {
        label: "Professional (4-star)",
        text: "Thank you for your review. We're glad you chose {business} and welcome any suggestions to make your next visit even better.",
    },
    {
        label: "Service recovery (1–2 star)",
        text: "We apologize for falling short. Please contact {business} directly so our manager can follow up with you today.",
    },
    {
        label: "HIPAA-aware (dental/medical tone)",
        text: "Thank you for your feedback. Out of respect for your privacy, we'd like to discuss the details offline — please call our office at your convenience.",
    },
    {
        label: "Restaurant / hospitality",
        text: "Thanks for dining with us! We're passing your note to our kitchen and front-of-house teams. We'd love to host you again soon.",
    },
] as const;

export function renderBonusTemplates(businessName: string): { label: string; text: string }[] {
    const biz = businessName.trim() || "our business";
    return BONUS_REVIEW_RESPONSE_TEMPLATES.map((t) => ({
        label: t.label,
        text: t.text.replace(/\{business\}/g, biz),
    }));
}
