import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/security/html-escape";
import { serializeJsonLd } from "@/lib/seo/serialize-json-ld";

describe("HTML serialization security", () => {
    it("escapes markup and attribute delimiters", () => {
        expect(escapeHtml(`<img src=x onerror="alert('x')">&`)).toBe(
            "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;",
        );
    });

    it("prevents JSON-LD values from closing the script element", () => {
        const serialized = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

        expect(serialized).not.toContain("</script>");
        expect(JSON.parse(serialized)).toEqual({ name: "</script><script>alert(1)</script>" });
    });
});
