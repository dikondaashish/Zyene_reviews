"use client";

import { useState } from "react";
import { SlugEditor } from "./slug-editor";
import { BrandingForm } from "./branding-form";
import { ReviewGatingForm } from "./review-gating-form";
import { PublicReviewFlow } from "@/app/r/[slug]/review-flow";
import { cn } from "@/lib/utils";
import { Link as LinkIcon, HelpCircle, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicProfileEditorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    business: any;
    initialSlug: string;
}

export function PublicProfileEditor({ business, initialSlug }: PublicProfileEditorProps) {
    const [previewState, setPreviewState] = useState({
        slug: initialSlug,
        brand_color: business.brand_color || "#0f172a",
        logo_url: business.logo_url,
        min_stars_for_google: business.min_stars_for_google || 4,
        review_gating_enabled: business.review_gating_enabled ?? true,
        welcome_message: business.welcome_message,
        apology_message: business.apology_message,
    });

    const handleValuesChange = (values: any) => {
        setPreviewState(prev => ({ ...prev, ...values }));
    };

    const previewUrl = `zyene.in/${previewState.slug}`;

    return (
        <div className="flex flex-col xl:flex-row gap-12 items-start">
            {/* Left Column: Forms */}
            <div className="flex-1 space-y-8 w-full min-w-0">
                <SlugEditor
                    businessId={business.id}
                    initialSlug={initialSlug}
                    onSlugChange={(slug) => handleValuesChange({ slug })}
                />

                <BrandingForm
                    business={business}
                    onValuesChange={handleValuesChange}
                    onLogoChange={(url) => handleValuesChange({ logo_url: url })}
                />

                <ReviewGatingForm
                    business={business}
                    onValuesChange={handleValuesChange}
                />
            </div>

            {/* Right Column: Preview (Simplified Model) */}
            <div className="hidden xl:flex flex-col gap-6 w-[380px] flex-shrink-0 sticky top-6">
                <div>
                    <div className="flex items-center gap-2 mb-3 justify-start px-2">
                        <span className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase">PREVIEW</span>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>

                    {/* Preview Container */}
                    <div className="mx-auto h-[740px] w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-[4px] border-slate-900 ring-1 ring-white/10">
                        {/* Status Bar Area (Mock) */}
                        <div className="h-8 w-full bg-transparent absolute top-0 z-20 pointer-events-none" />

                        {/* Content */}
                        <div className="h-full w-full overflow-y-auto no-scrollbar bg-slate-900">
                            <PublicReviewFlow
                                businessId={business.id}
                                businessName={business.name}
                                businessCategory={business.category}
                                brandColor={previewState.brand_color}
                                logoUrl={previewState.logo_url}
                                minStars={previewState.review_gating_enabled ? previewState.min_stars_for_google : 1}
                                welcomeMsg={previewState.welcome_message}
                                apologyMsg={previewState.apology_message}
                                isPreview={true}
                                className="min-h-full w-full rounded-[2rem]"
                            />
                        </div>
                    </div>
                </div>

                {/* Shareable Link Section */}
                <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm truncate">Shareable Link</span>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground truncate font-mono">
                                {previewUrl}
                            </p>
                        </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 font-semibold px-6">
                        SHARE
                    </Button>
                </div>

                {/* Footer */}
                <div className="text-center px-4">
                    <p className="text-xs text-muted-foreground items-center justify-center flex gap-1">
                        Want to remove Powered by <span className="font-semibold">Zyene</span> branding?
                    </p>
                    <a href="#" className="text-xs text-blue-600 hover:underline font-medium mt-1 block">
                        Contact sales
                    </a>
                </div>
            </div>
        </div>
    );
}
