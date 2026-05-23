import Image from "next/image";
import type { BlogAuthor } from "@/lib/phase4/blog-types";
import { resolveBlogAuthor, blogAuthorInitials } from "@/lib/phase4/blog-authors";
import { cn } from "@/lib/utils";

export function BlogAuthorByline({
    author,
    size = "sm",
    className,
}: {
    author: BlogAuthor;
    size?: "sm" | "md";
    className?: string;
}) {
    const resolved = resolveBlogAuthor(author);
    const initials = blogAuthorInitials(resolved.name);
    const avatarSize = size === "md" ? 40 : 28;
    const textClass = size === "md" ? "text-sm" : "text-xs";

    return (
        <div className={cn("flex items-center gap-2 min-w-0", className)}>
            {resolved.avatarUrl ? (
                <Image
                    src={resolved.avatarUrl}
                    alt=""
                    width={avatarSize}
                    height={avatarSize}
                    className="rounded-full object-cover ring-1 ring-border shrink-0"
                    style={{ width: avatarSize, height: avatarSize }}
                />
            ) : (
                <span
                    className={cn(
                        "inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold ring-1 ring-primary/20 shrink-0",
                        size === "md" ? "text-sm size-10" : "text-[10px] size-7"
                    )}
                    aria-hidden
                >
                    {initials}
                </span>
            )}
            <div className={cn("min-w-0 text-left", textClass)}>
                <p className="font-medium text-foreground truncate">{resolved.name}</p>
                {resolved.role ? (
                    <p className="text-muted-foreground truncate">{resolved.role}</p>
                ) : null}
            </div>
        </div>
    );
}
