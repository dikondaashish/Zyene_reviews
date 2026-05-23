import type { UseFormReturn } from "react-hook-form";
import type { ReviewTagItem } from "@/lib/review-flow/tag-display";
import type { ContentFormValues } from "@/components/settings/review-content-schema";

export type ReviewContentTabProps = {
    form: UseFormReturn<ContentFormValues>;
};

export type ReviewContentTagsTabProps = ReviewContentTabProps & {
    tagCategory: string;
    tagItems: ReviewTagItem[];
    tagsReady: boolean;
    setTagItems: (items: ReviewTagItem[]) => void;
};
