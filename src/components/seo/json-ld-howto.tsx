import { JsonLdScript } from "./json-ld-script";

export type HowToStep = {
    name: string;
    text: string;
    url?: string;
};

export function HowToJsonLd({
    name,
    description,
    steps,
    totalTime,
}: {
    name: string;
    description: string;
    steps: HowToStep[];
    totalTime?: string;
}) {
    if (steps.length === 0) return null;

    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        ...(totalTime ? { totalTime } : {}),
        step: steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.url ? { url: step.url } : {}),
        })),
    };

    return <JsonLdScript schema={schema} />;
}
