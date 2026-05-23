export interface TagsStepProps {
    resolvedBrandColor: string;
    tagsHeading?: string;
    tagsSubheading?: string;
    tags: string[];
    categoryKey: string;
    selectedTags: string[];
    showCustomInput: boolean;
    customTagInput: string;
    addedCustomTags: string[];
    hasTagSelection: boolean;
    enableStaffSelection: boolean;
    staffNames: string[];
    selectedStaff: string[];
    onToggleTag: (tag: string) => void;
    onToggleEverything: () => void;
    onOpenCustomInputPanel: () => void;
    onToggleCustomInput: () => void;
    onCustomTagInputChange: (value: string) => void;
    onAddCustomTag: () => void;
    onRemoveCustomTag: (index: number) => void;
    onToggleStaff: (name: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

export const TAG_ACTION_BTN_CLASS =
    "w-full min-h-11 rounded-xl text-sm font-semibold transition-all duration-200 border-2 active:scale-[0.98]";
