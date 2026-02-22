import { Building2, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrganizationDisplayProps {
    organization: {
        id: string;
        name: string;
    } | null;
}

export function OrganizationDisplay({ organization }: OrganizationDisplayProps) {
    return (
        <Button
            variant="outline"
            className="w-[220px] justify-between text-muted-foreground pointer-events-none"
            tabIndex={-1}
        >
            <div className="flex items-center overflow-hidden">
                <Building2 className="mr-2 h-4 w-4 shrink-0 text-foreground" />
                <span className="truncate text-foreground font-medium">
                    {organization?.name || "Organization"}
                </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    )
}
