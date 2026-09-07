import Image from "next/image";
import type { IndustryData } from "@/lib/industries/industry-data";
import { getIndustryImage } from "@/lib/industries/industry-imagery";

export function IndustriesIndustryUseCaseSection({ data }: { data: IndustryData }) {
    const steps = [{ title: "Starting point", copy: data.useCase.startingPoint }, { title: "A better routine", copy: data.useCase.workflow }, { title: "What to measure", copy: data.useCase.measures }];
    return (
        <section className="marketing-section bg-muted">
            <div className="marketing-container story-row">
                <div className="story-visual" data-reveal><Image src={getIndustryImage(data.slug).src} alt={getIndustryImage(data.slug, data.name).alt} fill sizes="(max-width: 767px) 100vw, 45vw" /></div>
                <div className="feature-detail-copy"><p className="marketing-eyebrow">An illustrative workflow</p><h2>A better day at your {data.nameSingular.toLowerCase()}.</h2><ol className="feature-detail-list">{steps.map((step, index) => <li key={step.title}><span className="text-primary">0{index + 1}</span><div><h3 className="mb-2 font-semibold">{step.title}</h3><p className="text-muted-foreground">{step.copy}</p></div></li>)}</ol><p className="mt-5 text-xs text-muted-foreground">This is not a customer testimonial or a promised result.</p></div>
            </div>
        </section>
    );
}
