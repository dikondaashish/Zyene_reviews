import type { FaqItem } from "@/components/seo/json-ld";
import { VERIFIED_COMPETITOR_FACTS } from "@/lib/comparisons/verified-competitor-facts";
import { TRIAL_SUMMARY } from "@/lib/marketing/trial-copy";
import {
    PRICES_CHECKED_ON,
    PROFESSIONAL_PRICE,
    STARTER_PRICE,
    STARTER_YEARLY_PRICE,
} from "@/lib/marketing/small-business-content";

const { birdeye, podium, nicejob, gatherup } = VERIFIED_COMPETITOR_FACTS;

/** Visible on /small-business and published as FAQPage JSON-LD; keep both in step. */
export const SMALL_BUSINESS_FAQS: FaqItem[] = [
    {
        question: "How much does review management software cost for a small business?",
        answer:
            `Zyene Reviews Starter costs ${STARTER_PRICE}/month (or ${STARTER_YEARLY_PRICE}/year) for one location. ` +
            `Professional is ${PROFESSIONAL_PRICE}/month for up to three locations. ` +
            `On public pricing pages checked ${PRICES_CHECKED_ON}, ${nicejob.name} lists ${nicejob.price}, ` +
            `${gatherup.name} lists ${gatherup.price}, and ${birdeye.name} and ${podium.name} quote custom pricing.`,
    },
    {
        question: "Do I have to sign a long-term contract?",
        answer:
            `No. Starter and Professional are billed monthly or annually and you can cancel future renewals in Billing. ${TRIAL_SUMMARY}`,
    },
    {
        question: "How long does setup take?",
        answer:
            "Sign-up takes under five minutes. Connect your Google Business Profile, then Yelp and Facebook, and you can usually send your first review request within two minutes of finishing setup.",
    },
    {
        question: "Which review platforms does Zyene Reviews support?",
        answer:
            "Reviews from Google Business Profile, Yelp and Facebook sync into one inbox on every paid plan. You can reply with AI drafts, and automatic replies are available for new Google reviews.",
    },
    {
        question: "Does Zyene Reviews follow Google's review policies?",
        answer:
            "Zyene is designed not to gate reviews. Customers who rate below your threshold see a private feedback form first, and that screen keeps a Go to Google link, so nobody is blocked from posting publicly. Zyene never posts a review for a customer. To stay within Google's policies, send requests to all your customers, not only happy ones.",
    },
];
