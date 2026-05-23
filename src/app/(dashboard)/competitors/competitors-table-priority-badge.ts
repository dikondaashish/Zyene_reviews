export function priorityBadgeVariant(
    priority: string
): "destructive" | "secondary" | "outline" {
    const p = String(priority || "").toLowerCase();
    if (p === "high") return "destructive";
    if (p === "medium") return "secondary";
    return "outline";
}
