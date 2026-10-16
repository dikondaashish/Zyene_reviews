import Link from "next/link";
import { INDUSTRY_WORKFLOWS } from "@/lib/marketing/industry-workflows";

export function IndustryWorkflowSection({ slug }: { slug: string }) {
  const workflow = INDUSTRY_WORKFLOWS[slug];
  if (!workflow) return null;
  return <section className="marketing-section bg-muted">
    <div className="marketing-container max-w-4xl">
      <p className="marketing-eyebrow">A practical workflow</p>
      <h2 className="text-[length:var(--fs-h2)]">{workflow.title}</h2>
      <p className="mt-5 leading-7 text-muted-foreground">{workflow.example}</p>
      <ol className="mt-6 list-decimal space-y-4 pl-6">{workflow.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <h3 className="mt-8 text-xl">Measure the work you can verify</h3>
      <p className="mt-3 leading-7 text-muted-foreground">{workflow.measure}</p>
      <nav aria-label="Related industry guides" className="mt-6 flex flex-wrap gap-5">{workflow.links.map((link) => <Link key={link.href} href={link.href} className="underline underline-offset-4">{link.label}</Link>)}</nav>
    </div>
  </section>;
}
