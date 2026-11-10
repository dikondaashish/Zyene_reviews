import { Plus } from "lucide-react";
import { renderInlineContent } from "@/components/marketing/render-inline-content";

/** Styled by .home-faq-list so pricing and homepage FAQs read the same. */
export function PricingClientFaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <details>
            <summary>
                {question}
                <Plus size={16} aria-hidden="true" />
            </summary>
            <p>{renderInlineContent(answer)}</p>
        </details>
    );
}
