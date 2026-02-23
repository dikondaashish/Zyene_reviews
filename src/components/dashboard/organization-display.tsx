import { Building2 } from "lucide-react"
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
            className="w-[220px] justify-start pointer-events-none"
            tabIndex={-1}
        >
            <Building2 className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate font-medium">
                {organization?.name || "Organization"}
            </span>
        </Button>
    )
}
