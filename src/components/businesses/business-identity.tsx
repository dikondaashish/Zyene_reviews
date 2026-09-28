"use client";

import Image from "next/image";
import { useState } from "react";

export function BusinessIdentity({ name, logoUrl }: { name: string; logoUrl: string | null }) {
    const [failed, setFailed] = useState(false);
    const initials = (name.match(/[\p{L}\p{N}]+/gu) ?? []).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();
    const hasLogo = logoUrl && /^(https?:\/\/|\/)/.test(logoUrl) && !failed;
    return (
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background text-sm font-semibold text-muted-foreground">
            {hasLogo ? <Image src={logoUrl} alt="" width={48} height={48} unoptimized className="size-full object-contain p-1" onError={() => setFailed(true)} /> : <span aria-hidden="true">{initials}</span>}
        </div>
    );
}
