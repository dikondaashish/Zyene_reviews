import Image from "next/image";
import { Check } from "lucide-react";
import type { GuidePreview } from "@/lib/marketing/lead-wizard-personalization";

/** Desktop left panel: the guide cover and "what you'll get" lines follow the visitor's answers live. */
export function HomeLeadWizardVisual({ preview, personalized }: { preview: GuidePreview; personalized: boolean }) {
    return (
        <div className="home-lead-wizard-visual" aria-hidden="true">
            <div className="home-lead-wizard-visual-header">
                <span>Zyene Reviews</span>
                <span>Free PDF guide</span>
            </div>
            <div className="home-lead-wizard-cover">
                <Image src="/marketing/home/zyene-overview-cover.webp" alt="" fill sizes="340px" />
                <div className="home-lead-wizard-cover-band" key={preview.title + preview.audience}>
                    <span>For {preview.audience}</span>
                    <strong>{preview.title}</strong>
                </div>
            </div>
            <div className="home-lead-wizard-visual-copy">
                <p className="home-lead-wizard-visual-kicker">{personalized ? "Personalized for you" : "What you'll get"}</p>
                <ul className="home-lead-wizard-bullets">
                    {preview.bullets.map((bullet) => (
                        <li key={bullet}>
                            <Check size={14} strokeWidth={3} />
                            {bullet}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/** Mobile stand-in for the left panel: one line that still shows the personalization. */
export function HomeLeadWizardPreviewChip({ preview }: { preview: GuidePreview }) {
    return (
        <p className="home-lead-wizard-chip" aria-live="polite">
            <span>Your guide:</span> {preview.title} · {preview.audience}
        </p>
    );
}
