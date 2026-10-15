import Link from "next/link";
import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";
import { FEATURE_WORKFLOWS } from "@/lib/marketing/feature-workflows";

export function FeatureWorkflowSection({ slug }: { slug: FeaturePillarSlug }) {
  const workflow = FEATURE_WORKFLOWS[slug];
  if (!workflow) return null;
  return (
    <section className="marketing-section">
      <div className="marketing-container max-w-4xl">
        <p className="marketing-eyebrow">Setup and scope</p>
        <h2 className="text-3xl">{workflow.title}</h2>
        <ol className="mt-8 list-decimal space-y-4 pl-6">
          {workflow.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <h3 className="mt-8 text-xl">What to check before you start</h3>
        <p className="mt-3 leading-7 text-muted-foreground">{workflow.limits}</p>
        <nav aria-label="Related feature guides" className="mt-6 flex flex-wrap gap-5">
          {workflow.links.map((link) => <Link key={link.href} href={link.href} className="underline underline-offset-4">{link.label}</Link>)}
        </nav>
      </div>
    </section>
  );
}
