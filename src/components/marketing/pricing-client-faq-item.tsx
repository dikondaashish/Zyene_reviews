import { Plus } from "lucide-react";

/** Styled by .home-faq-list so pricing and homepage FAQs read the same. */
export function PricingClientFaqItem({ question, answer }: { question: string; answer: string }) {
    return (
        <details>
            <summary>
                {question}
                <Plus size={16} aria-hidden="true" />
            </summary>
            <p>{answer}</p>
        </details>
    );
}
