import { Separator } from "@/components/ui/separator";

export default function BillingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Billing Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription and billing details.
                </p>
            </div>
            <Separator />
            <div className="p-4 border rounded-lg bg-muted/10 text-center text-muted-foreground">
                Billing features coming soon.
            </div>
        </div>
    );
}
