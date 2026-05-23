import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_TAGS = 12;

export function ReviewTagChipEditorActions({
    itemCount,
    onAdd,
    onReset,
}: {
    itemCount: number;
    onAdd: () => void;
    onReset: () => void;
}) {
    return (
        <>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={onAdd}
                    disabled={itemCount >= MAX_TAGS}
                >
                    <Plus className="size-3.5" />
                    Add tag
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    onClick={onReset}
                >
                    <RotateCcw className="size-3.5" />
                    Reset to category defaults
                </Button>
            </div>

            {itemCount >= MAX_TAGS && (
                <p className="text-xs text-muted-foreground">{MAX_TAGS} tags max</p>
            )}
        </>
    );
}
