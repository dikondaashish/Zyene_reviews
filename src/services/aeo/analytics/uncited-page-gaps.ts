function terms(value: string): Set<string> {
    return new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((term) => !["the", "and", "for", "with", "from"].includes(term)) ?? []);
}

export type PageTopicFact = { url: string; text: string };
export type PromptTopicFact = { id: string; text: string };

export function findUncitedRelevantPages(input: {
    pages: readonly PageTopicFact[]; prompts: readonly PromptTopicFact[]; citedUrls: ReadonlySet<string>;
}) {
    return input.pages.filter((page) => !input.citedUrls.has(page.url)).flatMap((page) => {
        const pageTerms = terms(page.text);
        const matches = input.prompts.map((prompt) => {
            const promptTerms = terms(prompt.text);
            const overlap = [...promptTerms].filter((term) => pageTerms.has(term));
            return { promptId: prompt.id, prompt: prompt.text, score: promptTerms.size ? overlap.length / promptTerms.size : 0 };
        }).filter((match) => match.score >= 0.25).sort((a, b) => b.score - a.score);
        return matches[0] ? [{ url: page.url, ...matches[0] }] : [];
    }).sort((a, b) => b.score - a.score);
}
