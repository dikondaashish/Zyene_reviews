"use client";

import { useState } from "react";
import { SlugEditor } from "./slug-editor";
import { BrandingForm } from "./branding-form";
import { ReviewGatingForm } from "./review-gating-form";
import { PublicReviewFlow } from "@/app/r/[slug]/review-flow";
import { cn } from "@/lib/utils";

interface PublicProfileEditorProps {
    business: any; // Type properly in real app, or import shared type
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

    return (
        <div className="flex flex-col xl:flex-row gap-8 items-start">
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

            {/* Right Column: Preview */}
            <div className="hidden xl:block w-[400px] flex-shrink-0 sticky top-6">
                <div className="text-sm font-medium text-muted-foreground mb-4 text-center uppercase tracking-wider">
                    Live Preview (iPhone 17 Pro Max)
                </div>
                {/* Phone Frame */}
                <div className="relative mx-auto border-gray-900 bg-gray-900 border-[14px] rounded-[3rem] h-[800px] w-[390px] shadow-2xl ring-1 ring-gray-900/10">
                    {/* Notch/Dynamic Island */}
                    <div className="w-[126px] h-[36px] bg-black top-2 rounded-[18px] left-1/2 -translate-x-1/2 absolute z-20 pointer-events-none"></div>

                    {/* Buttons */}
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>

                    {/* Screen Content */}
                    <div className="rounded-[2.2rem] overflow-hidden w-full h-full bg-white relative">
                        {/* Status Bar Mock */}
                        <div className="absolute top-0 w-full h-12 bg-transparent z-10 flex justify-between items-center px-6 pt-2 font-medium text-white text-[15px] drop-shadow-md">
                            <span>9:41</span>
                            <div className="flex items-center gap-1.5">
                                <span className="h-3 w-3">📶</span>
                                <span className="h-3 w-3">🔋</span>
                            </div>
                        </div>

                        {/* App Content */}
                        <div className="absolute inset-0 overflow-y-auto no-scrollbar bg-black">
                            {/* Scale down slightly to fit content nicely */}
                            <div className="origin-top scale-[0.95] h-full">
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
                                />
                            </div>
                        </div>

                        {/* Home Indicator */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-20"></div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-6">
                    Preview updates in real-time as you edit settings.
                </p>
            </div>
        </div>
    );
}
