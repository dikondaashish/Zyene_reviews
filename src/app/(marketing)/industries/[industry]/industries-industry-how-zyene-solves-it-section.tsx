import type { IndustryData } from "@/lib/industries/industry-data";

export function IndustriesIndustryHowZyeneSolvesItSection({ data }: { data: IndustryData }) {
    return <section className="marketing-section"><div className="marketing-container"><div className="marketing-section-heading"><h2>Built around your<br />working day.</h2><p>The tools to make reputation management a natural part of running your {data.nameSingular.toLowerCase()}.</p></div><div className="grid gap-x-20 md:grid-cols-2">{data.solutions.map((solution, index) => <article key={solution.title} className="border-t border-border py-8"><span className="mb-6 block text-xs text-primary">0{index + 1}</span><h3 className="mb-4 text-2xl font-semibold tracking-tight">{solution.title}</h3><p className="max-w-lg text-muted-foreground">{solution.description}</p></article>)}</div></div></section>;
}
