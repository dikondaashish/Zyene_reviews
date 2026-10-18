import Image from "next/image";
import { Code2, LayoutGrid, Webhook } from "lucide-react";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";
import type { IntegrationItem } from "./integrations-types";

const ICONS = { api: Code2, webhook: Webhook, widget: LayoutGrid } as const;

/** App-icon tile: a white plate so every brand mark stays crisp and legible, in light or dark mode. */
export function IntegrationLogoTile({ item }: { item: IntegrationItem }) {
    const Icon = item.icon ? ICONS[item.icon] : null;
    return (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
            {item.domain ? (
                <Image src={getBrandLogoUrl(item.domain)} alt={`${item.name} logo`} width={32} height={32} className="size-8 object-contain" unoptimized />
            ) : Icon ? (
                <Icon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
            ) : null}
        </div>
    );
}
