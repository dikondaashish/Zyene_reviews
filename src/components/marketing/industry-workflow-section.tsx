import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { INDUSTRY_WORKFLOWS } from "@/lib/marketing/industry-workflows";

/** Planning example on a card surface, so it reads differently from the open sections around it. */
export function IndustryWorkflowSection({ slug }: { slug: string }) {
  const workflow = INDUSTRY_WORKFLOWS[slug];
  if (!workflow) return null;
  return (
    <section className="marketing-section" aria-labelledby="ind-workflow-heading">
      <div className="marketing-container">
        <div className="ind-workflow">
          <div>
            <p className="marketing-eyebrow">A practical workflow</p>
            <h2 id="ind-workflow-heading">{workflow.title}</h2>
            <p className="ind-workflow-example">{workflow.example}</p>
            <nav aria-label="Related industry guides" className="ind-workflow-links">
              {workflow.links.map((link) => (
                <Link key={link.href} href={link.href} className="home-text-link">
                  {link.label} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <ol className="ind-workflow-steps">
              {workflow.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <h3>Measure the work you can verify</h3>
            <p className="ind-workflow-measure">{workflow.measure}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
