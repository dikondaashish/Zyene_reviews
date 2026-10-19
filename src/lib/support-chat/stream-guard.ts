import { SYSTEM_PROMPT_CANARY, stripForeignLinks } from "@/lib/support-chat/guardrails";
import { META_MARKER } from "@/lib/support-chat/reply-meta";

const MAX_REPLY_CHARS = 1_800;

/**
 * Sits between the model stream and the visitor. Text is released one complete
 * sentence at a time, after the same checks the non-streaming reply used to get
 * (prompt-leak canary, HTML stripping, first-party links only), and the trailing
 * metadata line is held back so it never reaches the page.
 */
export class ReplyStreamGuard {
    private raw = "";
    private released = 0;
    private blocked = false;

    /** Feed a model chunk; returns text that is now safe to show (may be empty). */
    push(chunk: string): string {
        if (this.blocked) return "";
        this.raw += chunk;
        if (this.raw.includes(SYSTEM_PROMPT_CANARY)) {
            this.blocked = true;
            return "";
        }
        const body = this.replyBody();
        const end = this.safeBoundary(body);
        if (end <= this.released) return "";
        const segment = body.slice(this.released, end);
        this.released = end;
        return clean(segment);
    }

    /** Call once the model is done: the rest of the reply text plus the raw metadata. */
    finish(): { text: string; metaRaw: string; blocked: boolean } {
        if (this.blocked) return { text: "", metaRaw: "", blocked: true };
        const body = this.replyBody();
        const text = clean(body.slice(this.released));
        this.released = body.length;
        const markerAt = this.raw.indexOf(META_MARKER);
        return { text, metaRaw: markerAt === -1 ? "" : this.raw.slice(markerAt + META_MARKER.length), blocked: false };
    }

    get isBlocked(): boolean {
        return this.blocked;
    }

    private replyBody(): string {
        const markerAt = this.raw.indexOf(META_MARKER);
        const body = markerAt === -1 ? this.raw : this.raw.slice(0, markerAt);
        return body.slice(0, MAX_REPLY_CHARS);
    }

    /** Last sentence or line end, never inside a possible half-written marker or link. */
    private safeBoundary(body: string): number {
        let limit = body.length;
        for (let i = Math.max(0, body.length - META_MARKER.length); i < body.length; i++) {
            if (META_MARKER.startsWith(body.slice(i))) {
                limit = i;
                break;
            }
        }
        const openLink = body.lastIndexOf("[");
        if (openLink !== -1 && !/\[[^\]]*\]\([^)]*\)/.test(body.slice(openLink))) limit = Math.min(limit, openLink);
        const window = body.slice(0, limit);
        const match = [...window.matchAll(/[.!?](?=\s)|\n/g)].at(-1);
        return match?.index === undefined ? this.released : match.index + 1;
    }
}

function clean(segment: string): string {
    return stripForeignLinks(segment.replace(/<[^>]{1,200}>/g, ""));
}
