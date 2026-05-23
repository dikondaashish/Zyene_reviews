import { Badge } from "@/components/ui/badge";
import type { GoogleAdminRow } from "./google-account-access-panel-types";
import { parseGoogleAdminIdentity } from "./google-account-access-panel-types";

export function GoogleAccountAccessAdminsList({ admins }: { admins: GoogleAdminRow[] }) {
    if (admins.length === 0) return null;

    return (
        <div className="space-y-2">
            <h5 className="text-sm font-medium">Account managers on linked account</h5>
            <ul className="text-sm space-y-1 border rounded-md divide-y max-h-48 overflow-y-auto">
                {admins.map((a, i) => (
                    <li key={a.name || i} className="px-3 py-2 flex flex-wrap gap-2 items-center">
                        <span className="text-sm break-all">{parseGoogleAdminIdentity(a).label}</span>
                        {a.role && (
                            <Badge variant="outline" className="text-[10px]">
                                {a.role}
                            </Badge>
                        )}
                        {a.pendingInvitation && (
                            <Badge variant="secondary" className="text-[10px]">
                                Pending
                            </Badge>
                        )}
                    </li>
                ))}
            </ul>
            <p className="text-xs text-muted-foreground">
                To add or remove managers, use{" "}
                <a
                    href="https://business.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                >
                    Google Business Profile
                </a>
                .
            </p>
        </div>
    );
}
