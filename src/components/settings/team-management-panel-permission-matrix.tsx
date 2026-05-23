import { Check, Minus } from "lucide-react";

import { TEAM_PERMISSION_ROWS } from "./team-management-panel-permission-rows";

export function TeamManagementPanelPermissionMatrix() {
    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-border bg-muted/40">
                    <tr className="text-left">
                        <th className="px-4 py-3 font-semibold">Action</th>
                        <th className="px-4 py-3 text-center font-semibold">Owner</th>
                        <th className="px-4 py-3 text-center font-semibold">Admin</th>
                        <th className="px-4 py-3 text-center font-semibold">Manager</th>
                        <th className="px-4 py-3 text-center font-semibold">Member</th>
                        <th className="px-4 py-3 text-center font-semibold">Viewer</th>
                    </tr>
                </thead>
                <tbody>
                    {TEAM_PERMISSION_ROWS.map((row) => (
                        <tr key={row.action} className="border-b border-border/60 last:border-b-0">
                            <td className="px-4 py-3 font-medium text-foreground/90">{row.action}</td>
                            {(["owner", "admin", "manager", "member", "viewer"] as const).map((role) => (
                                <td key={role} className="px-4 py-3 text-center">
                                    {row[role] ? (
                                        <Check className="mx-auto h-4 w-4 text-chart-2" />
                                    ) : (
                                        <Minus className="mx-auto h-4 w-4 text-muted-foreground/80" />
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
