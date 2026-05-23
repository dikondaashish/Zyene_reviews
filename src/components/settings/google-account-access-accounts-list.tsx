import { Badge } from "@/components/ui/badge";
import type { GoogleAccountSummary } from "./google-account-access-panel-types";

export function GoogleAccountAccessAccountsList({
    accounts,
    linkedLocationId,
}: {
    accounts: GoogleAccountSummary[];
    linkedLocationId: string | null;
}) {
    return (
        <div className="space-y-3">
            <h5 className="text-sm font-medium">Accounts & locations</h5>
            <p className="text-xs text-muted-foreground">
                OAuth token can access these Google Business Profile accounts. The row linked to Zyene Reviews is
                marked.
                {linkedLocationId && (
                    <>
                        {" "}
                        Active location ID: <code className="text-xs bg-muted px-1 rounded">{linkedLocationId}</code>
                    </>
                )}
            </p>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {accounts.map((acc) => (
                    <div
                        key={acc.resourceName}
                        className={`rounded-md border p-3 text-sm ${acc.isLinkedToZyeneReviews ? "border-primary/20 bg-primary/10" : ""}`}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{acc.accountName}</span>
                            {acc.isLinkedToZyeneReviews && (
                                <Badge variant="secondary" className="text-[10px]">
                                    Linked to Zyene Reviews
                                </Badge>
                            )}
                            {acc.type && <span className="text-xs text-muted-foreground">({acc.type})</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {acc.locationCount} location{acc.locationCount === 1 ? "" : "s"}
                            {acc.verificationState ? ` · ${acc.verificationState}` : ""}
                        </p>
                        {acc.locations.length > 0 && (
                            <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                                {acc.locations.map((loc) => (
                                    <li key={loc.name} className="truncate">
                                        {loc.title}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
