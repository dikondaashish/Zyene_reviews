import Image from "next/image";
import { cn } from "@/lib/utils";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

/**
 * The one way a brand logo sits on the integrations page: a white square so the
 * brand's own colours read true in light and dark mode, logo centred at 24px.
 */
export function BrandLogoTile({ domain, name, className }: { domain: string; name: string; className?: string }) {
    return (
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-white", className)}>
            <Image src={getBrandLogoUrl(domain)} alt={`${name} logo`} width={24} height={24} unoptimized className="size-6 object-contain" />
        </div>
    );
}
