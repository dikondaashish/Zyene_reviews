import { buildSiteDocuments, type SiteDocument } from "@/lib/support-chat/retrieval/site-documents";

/**
 * BM25 keyword retrieval over the site's own content. The corpus is a few hundred
 * passages that ship with the app, so an in-memory index built once per server
 * instance beats a vector database on cost, latency and moving parts.
 */

const STOPWORDS = new Set(
    "a an the and or but if of to in on for with at by from is are was were be been do does did i you we they it this that these those my your our can how what when where which who why will would should could about into than then so not no yes".split(" "),
);

/** Small synonym map so everyday words reach product vocabulary. */
const SYNONYMS: Record<string, string[]> = {
    price: ["pricing", "plan", "cost"], cost: ["pricing", "price", "plan"], cheap: ["pricing", "price"],
    text: ["sms"], sms: ["text"], ask: ["request"], request: ["ask"], reply: ["respond", "response"],
    respond: ["reply"], connect: ["integration", "integrate"], integrate: ["integration", "connect"],
    pos: ["square", "clover", "integration"], negative: ["bad", "private", "feedback"], bad: ["negative"],
    competitor: ["competitors", "compare"], qr: ["code"], nfc: ["stand", "tap"], seo: ["search", "local"],
    ai: ["assistant", "automatic"], chatgpt: ["aeo", "ai"], restaurant: ["restaurants"], dentist: ["dental"],
};

export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1 && !STOPWORDS.has(token))
        .map((token) => (token.length > 4 && token.endsWith("s") && !token.endsWith("ss") ? token.slice(0, -1) : token));
}

interface IndexedDocument {
    doc: SiteDocument;
    terms: Map<string, number>;
    length: number;
}

interface SearchIndex {
    docs: IndexedDocument[];
    documentFrequency: Map<string, number>;
    averageLength: number;
}

export function buildIndex(documents: SiteDocument[]): SearchIndex {
    const documentFrequency = new Map<string, number>();
    const docs = documents.map((doc) => {
        // Titles are repeated so a title match outranks a passing mention in body text.
        const tokens = tokenize(`${doc.title} ${doc.title} ${doc.title} ${doc.text}`);
        const terms = new Map<string, number>();
        for (const token of tokens) terms.set(token, (terms.get(token) ?? 0) + 1);
        for (const term of terms.keys()) documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
        return { doc, terms, length: tokens.length };
    });
    const averageLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(docs.length, 1);
    return { docs, documentFrequency, averageLength };
}

const K1 = 1.4;
const B = 0.75;

export function searchIndex(index: SearchIndex, query: string, limit = 5): SiteDocument[] {
    const base = tokenize(query);
    const expanded = [...new Set([...base, ...base.flatMap((t) => SYNONYMS[t] ?? [])])];
    if (expanded.length === 0) return [];
    const total = index.docs.length;
    const scored = index.docs.map((entry) => {
        let score = 0;
        for (const term of expanded) {
            const tf = entry.terms.get(term);
            if (!tf) continue;
            const df = index.documentFrequency.get(term) ?? 0;
            const idf = Math.log(1 + (total - df + 0.5) / (df + 0.5));
            const weight = base.includes(term) ? 1 : 0.5;
            score += weight * idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * entry.length) / index.averageLength)));
        }
        return { doc: entry.doc, score };
    });
    const ranked = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
    // One passage per page keeps the context varied.
    const seen = new Set<string>();
    const results: SiteDocument[] = [];
    for (const { doc } of ranked) {
        if (seen.has(doc.url)) continue;
        seen.add(doc.url);
        results.push(doc);
        if (results.length >= limit) break;
    }
    return results;
}

let cached: SearchIndex | null = null;

/** Lazily builds the site index once per server instance. */
export function searchSiteContent(query: string, limit = 5): SiteDocument[] {
    cached ??= buildIndex(buildSiteDocuments());
    return searchIndex(cached, query, limit);
}
