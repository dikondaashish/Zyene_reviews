import { TagsStepBackButton } from "./tags-step-back-button";
import { TagsStepContinueButton } from "./tags-step-continue-back";
import { TagsStepCustomTags } from "./tags-step-custom-tags";
import { TagsStepProgressHeader } from "./tags-step-progress-header";
import { TagsStepStaffSection } from "./tags-step-staff-section";
import { TagsStepTagGrid } from "./tags-step-tag-grid";
import type { TagsStepProps } from "./tags-step-types";

export type { TagsStepProps } from "./tags-step-types";

export function TagsStep({
    resolvedBrandColor,
    tagsHeading,
    tagsSubheading,
    tags,
    categoryKey,
    selectedTags,
    showCustomInput,
    customTagInput,
    addedCustomTags,
    hasTagSelection,
    enableStaffSelection,
    staffNames,
    selectedStaff,
    onToggleTag,
    onToggleEverything,
    onOpenCustomInputPanel,
    onToggleCustomInput,
    onCustomTagInputChange,
    onAddCustomTag,
    onRemoveCustomTag,
    onToggleStaff,
    onContinue,
    onBack,
}: TagsStepProps) {
    return (
        <div className="px-4 pt-5 pb-0 sm:px-6 sm:pt-6 animate-in fade-in duration-200 motion-reduce:animate-none">
            <div className="flex flex-col gap-4">
                <TagsStepProgressHeader
                    resolvedBrandColor={resolvedBrandColor}
                    tagsHeading={tagsHeading}
                    tagsSubheading={tagsSubheading}
                />

                <TagsStepTagGrid
                    tags={tags}
                    categoryKey={categoryKey}
                    selectedTags={selectedTags}
                    resolvedBrandColor={resolvedBrandColor}
                    onToggleTag={onToggleTag}
                />

                <TagsStepCustomTags
                    resolvedBrandColor={resolvedBrandColor}
                    selectedTags={selectedTags}
                    showCustomInput={showCustomInput}
                    customTagInput={customTagInput}
                    addedCustomTags={addedCustomTags}
                    onToggleEverything={onToggleEverything}
                    onOpenCustomInputPanel={onOpenCustomInputPanel}
                    onToggleCustomInput={onToggleCustomInput}
                    onCustomTagInputChange={onCustomTagInputChange}
                    onAddCustomTag={onAddCustomTag}
                    onRemoveCustomTag={onRemoveCustomTag}
                />

                {enableStaffSelection && (
                    <TagsStepStaffSection
                        staffNames={staffNames}
                        selectedStaff={selectedStaff}
                        resolvedBrandColor={resolvedBrandColor}
                        onToggleStaff={onToggleStaff}
                    />
                )}

                <TagsStepContinueButton resolvedBrandColor={resolvedBrandColor} hasTagSelection={hasTagSelection} onContinue={onContinue} />
            </div>

            <TagsStepBackButton onBack={onBack} />
        </div>
    );
}
