import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessesEmptyState() {
    return (
        <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-muted/30 border-dashed">
            <div className="h-12 w-12 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No businesses yet</h3>
            <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                Add your first business to start managing reviews and growing your online reputation.
            </p>
            <Link href="/businesses/add">
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add a business
                </Button>
            </Link>
        </div>
    );
}
