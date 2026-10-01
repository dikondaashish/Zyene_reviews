import Image from "next/image";

export function AccessErrorMascot() {
    return (
        <div aria-hidden="true" className="relative mx-auto mb-4 mt-6 flex h-40 w-64 max-w-full items-end justify-center">
            <span className="review-access-callout absolute right-0 top-1 rounded-xl rounded-bl-sm border border-border bg-canvas-elevated px-3 py-2 text-xs font-medium text-foreground">
                A little help, owner?
            </span>
            <Image
                src="/brand/mascot/zyene-mascot-needs-help-v1.png"
                alt=""
                width={128}
                height={128}
                sizes="128px"
                loading="eager"
                className="review-access-mascot size-32 object-contain"
            />
        </div>
    );
}
