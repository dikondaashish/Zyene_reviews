import Link from "next/link";
import Image from "next/image";

export function MarketingLayoutHeaderBrand() {
    return (
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 group">
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded shadow-sm ring-1 ring-border/60 group-hover:ring-primary/50 transition-colors">
                <Image
                    src="/Main%20logo.png"
                    alt="Zyene Reviews logo"
                    width={36}
                    height={36}
                    className="object-cover size-full"
                    priority
                />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-xl text-foreground leading-none tracking-tight">
                    <span className="text-primary">Zyene</span> Reviews
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-[0.15em] uppercase leading-none mt-1">
                    Grow local to global
                </span>
            </div>
        </Link>
    );
}
