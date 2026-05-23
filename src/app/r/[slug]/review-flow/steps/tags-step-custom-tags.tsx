import { TagsStepCustomInput } from "./tags-step-custom-input";
import { TagsStepEverythingButton } from "./tags-step-everything-button";

export interface TagsStepCustomTagsProps {
    resolvedBrandColor: string;
    selectedTags: string[];
    showCustomInput: boolean;
    customTagInput: string;
    addedCustomTags: string[];
    onToggleEverything: () => void;
    onOpenCustomInputPanel: () => void;
    onToggleCustomInput: () => void;
    onCustomTagInputChange: (value: string) => void;
    onAddCustomTag: () => void;
    onRemoveCustomTag: (index: number) => void;
}

export function TagsStepCustomTags(props: TagsStepCustomTagsProps) {
    return (
        <div className="space-y-2">
            <TagsStepEverythingButton
                resolvedBrandColor={props.resolvedBrandColor}
                selectedTags={props.selectedTags}
                onToggleEverything={props.onToggleEverything}
            />
            <TagsStepCustomInput
                resolvedBrandColor={props.resolvedBrandColor}
                showCustomInput={props.showCustomInput}
                customTagInput={props.customTagInput}
                addedCustomTags={props.addedCustomTags}
                onOpenCustomInputPanel={props.onOpenCustomInputPanel}
                onToggleCustomInput={props.onToggleCustomInput}
                onCustomTagInputChange={props.onCustomTagInputChange}
                onAddCustomTag={props.onAddCustomTag}
                onRemoveCustomTag={props.onRemoveCustomTag}
            />
        </div>
    );
}
