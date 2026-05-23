import type { TeamRoleBadgeVariant } from "@/types/components";

export function teamTableMemberInitials(name: string) {
    return (
        name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?"
    );
}

export function teamTableRoleBadgeVariant(role: string): TeamRoleBadgeVariant {
    switch (role.toLowerCase()) {
        case "owner":
        case "org_owner":
            return "default";
        case "admin":
        case "org_admin":
            return "secondary";
        case "manager":
            return "secondary";
        default:
            return "outline";
    }
}
