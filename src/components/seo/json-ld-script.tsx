export function JsonLdScript({ schema }: { schema: Record<string, unknown> }) {
    return (
        <script
            id={`json-ld-${hashSchema(schema)}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
    );
}

/** Stable short id for Script elements when @id is absent. */
function hashSchema(schema: Record<string, unknown>): string {
    const key = String(schema["@type"] ?? schema["@id"] ?? "schema");
    return key.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 48);
}
import { serializeJsonLd } from "@/lib/seo/serialize-json-ld";
