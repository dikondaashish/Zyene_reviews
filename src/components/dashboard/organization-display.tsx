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
            className="pointer-events-none hidden min-w-0 max-w-[min(42vw,11rem)] justify-start sm:flex lg:max-w-[220px]"
            tabIndex={-1}
        >
            <Building2 className="mr-2 shrink-0 size-4" />
            <span className="truncate font-medium">
                {organization?.name || "Organization"}
            </span>
        </Button>
    )
}
