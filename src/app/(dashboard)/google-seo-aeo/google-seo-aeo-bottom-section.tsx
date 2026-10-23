import { DescriptionOptimizerCard } from "@/components/google-seo-aeo/description-optimizer-card";
import { GbpContentOptimizerCard } from "@/components/google-seo-aeo/gbp-content-optimizer-card";
import { EstimatedAeoSurfaces } from "@/components/google-seo-aeo/estimated-aeo-surfaces";
import { areEstimatedAeoSurfacesEnabled } from "@/lib/features/aeo-surfaces";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";

export function GoogleSeoAeoBottomSection({ content }: { content: GoogleSeoAeoContentProps }) {
    return (
        <>
            <section className="space-y-4" aria-labelledby="content-workspace-title">
                <div>
                    <h2 id="content-workspace-title" className="ui-section-title">
                        Write better Google content with AI
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Get a stronger business description and ready-to-post updates in seconds. Nothing goes live on
                        Google until you review and approve it.
                    </p>
                </div>
                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                    <div id="description-optimizer" className="scroll-mt-24">
                        <DescriptionOptimizerCard
                            businessId={content.businessId}
                            currentDescription={content.listingDescription}
                            topKeywords={content.topKeywordList}
                        />
                    </div>
                    <div id="gbp-content-optimizer" className="scroll-mt-24">
                        <GbpContentOptimizerCard businessId={content.businessId} topKeywords={content.topKeywordList} />
                    </div>
                </div>
            </section>

            {areEstimatedAeoSurfacesEnabled() ? <EstimatedAeoSurfaces content={content} /> : null}
        </>
    );
}
