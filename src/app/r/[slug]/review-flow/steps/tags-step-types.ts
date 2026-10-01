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
    "flex w-full items-center justify-center gap-2 min-h-12 px-3 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none";
