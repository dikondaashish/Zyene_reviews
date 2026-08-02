import { buildPlgMarketingUrl } from "@/lib/growth/plg-attribution";

/** Subtle PLG CTA shown on embeddable /w/[slug] widgets (Phase 7.1). */
export function WidgetPlgFooter() {
    const href = buildPlgMarketingUrl("widget");
    return (
        <div className="w-full border-t border-border/60 bg-muted/30 px-3 py-2 text-center">
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                Get your own review widget—start a free trial
            </a>
        </div>
    );
}
