"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Star, Tag, Globe, MessageSquare, CheckCircle, Palette } from "lucide-react";
import { ReviewContentBrandingTab } from "@/components/settings/review-content-branding-tab";
import { ReviewContentFeedbackTab } from "@/components/settings/review-content-feedback-tab";
import { ReviewContentGoogleTab } from "@/components/settings/review-content-google-tab";
import { ReviewContentRatingTab } from "@/components/settings/review-content-rating-tab";
import { ReviewContentSuccessTab } from "@/components/settings/review-content-success-tab";
import { ReviewContentTagsTab } from "@/components/settings/review-content-tags-tab";
import { useReviewContentForm } from "@/components/settings/use-review-content-form";
import type { PublicProfilePreviewValues } from "@/types/components";

export function ReviewContentForm({
    businessId,
    businessCategory = "other",
    onValuesChange,
    onTabChange,
}: {
    businessId: string;
    businessCategory?: string;
    onValuesChange?: (values: Partial<PublicProfilePreviewValues>) => void;
    onTabChange?: (tab: string) => void;
}) {
    const {
        form,
        isLoading,
        isSaving,
        onSubmit,
        uploadingFooterLogo,
        handleFooterLogoUpload,
        removeFooterLogo,
        tagCategory,
        tagItems,
        setTagItems,
        tagsReady,
    } = useReviewContentForm(businessId, businessCategory, onValuesChange);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-muted-foreground size-6" />
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs defaultValue="rating" className="w-full" onValueChange={onTabChange}>
                        <div className="border-b bg-muted/40 px-6 pt-5 pb-0">
                            <h3 className="text-lg font-semibold text-foreground mb-1">Review Flow Content</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Customize every step of your customer review experience.
                            </p>
                            <TabsList
                                variant="line"
                                className="h-auto w-full min-w-0 justify-start gap-0 overflow-x-auto overflow-y-hidden flex-nowrap no-scrollbar border-0 bg-transparent p-0"
                            >
                                <TabsTrigger value="rating" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Star className="mr-1.5 size-3.5" />
                                    Rating
                                </TabsTrigger>
                                <TabsTrigger value="tags" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Tag className="mr-1.5 size-3.5" />
                                    Tags
                                </TabsTrigger>
                                <TabsTrigger value="google" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Globe className="mr-1.5 size-3.5" />
                                    Review Site
                                </TabsTrigger>
                                <TabsTrigger value="feedback" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <MessageSquare className="mr-1.5 size-3.5" />
                                    Feedback
                                </TabsTrigger>
                                <TabsTrigger value="success" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <CheckCircle className="mr-1.5 size-3.5" />
                                    Success
                                </TabsTrigger>
                                <TabsTrigger value="branding" className="whitespace-nowrap data-[state=active]:text-primary">
                                    <Palette className="mr-1.5 size-3.5" />
                                    Branding
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 space-y-6">
                            <ReviewContentRatingTab form={form} />
                            <ReviewContentTagsTab
                                form={form}
                                tagCategory={tagCategory}
                                tagItems={tagItems}
                                tagsReady={tagsReady}
                                setTagItems={setTagItems}
                            />
                            <ReviewContentGoogleTab form={form} />
                            <ReviewContentFeedbackTab form={form} />
                            <ReviewContentSuccessTab form={form} />
                            <ReviewContentBrandingTab
                                form={form}
                                uploadingFooterLogo={uploadingFooterLogo}
                                handleFooterLogoUpload={handleFooterLogoUpload}
                                removeFooterLogo={removeFooterLogo}
                            />
                        </div>

                        <div className="border-t bg-muted/30 px-6 py-4 flex justify-end items-center gap-4">
                            {form.formState.isDirty && (
                                <span className="text-sm text-chart-4 font-medium hidden sm:inline-block">
                                    Unsaved changes
                                </span>
                            )}
                            <Button
                                type="submit"
                                disabled={isSaving || !form.formState.isDirty}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-10 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin size-4" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 size-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}
