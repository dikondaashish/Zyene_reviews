"use client";

import { SlugEditor } from "./slug-editor";
import { BrandingForm } from "./branding-form";
import { ReviewContentForm } from "./review-content-form";
import type { PublicProfileBusinessRecord, PublicProfilePreviewValues } from "@/types/components";

interface PublicProfileEditorFormColumnProps {
    business: PublicProfileBusinessRecord;
    initialSlug: string;
    onSlugChange: (slug: string) => void;
    onValuesChange: (values: Partial<PublicProfilePreviewValues>) => void;
    onLogoChange: (url: string | null) => void;
    onTabChange: (tab: string) => void;
}

export function PublicProfileEditorFormColumn({
    business,
    initialSlug,
    onSlugChange,
    onValuesChange,
    onLogoChange,
    onTabChange,
}: PublicProfileEditorFormColumnProps) {
    return (
        <div className="space-y-8 w-full min-w-0 order-2 xl:order-1">
            <SlugEditor businessId={business.id} initialSlug={initialSlug} onSlugChange={onSlugChange} />

            <BrandingForm business={business} onValuesChange={onValuesChange} onLogoChange={onLogoChange} />

            <ReviewContentForm
                businessId={business.id}
                businessCategory={business.category || "other"}
                onValuesChange={onValuesChange}
                onTabChange={onTabChange}
            />
        </div>
    );
}
