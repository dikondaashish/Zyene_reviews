import Script from "next/script";

export function JsonLdScript({ schema }: { schema: Record<string, unknown> }) {
    return (
        <Script
            id={`json-ld-${hashSchema(schema)}`}
            type="application/ld+json"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/** Stable short id for Script elements when @id is absent. */
function hashSchema(schema: Record<string, unknown>): string {
    const key = String(schema["@type"] ?? schema["@id"] ?? "schema");
    return key.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 48);
}
