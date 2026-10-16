import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { TrialTerms } from "@/components/marketing/trial-terms";
import { WORKSPACE_MODULES } from "@/components/marketing/marketing-home/home-workspace-modules";

export function MarketingHomeWorkspace() {
  return (
    <section className="marketing-section home-workspace" aria-labelledby="home-workspace-heading">
      <div className="marketing-container">
        <div className="marketing-section-heading">
          <div>
            <p className="marketing-eyebrow">Inside your workspace</p>
            <h2 id="home-workspace-heading">Every tool, for every location.</h2>
          </div>
          <p>
            <Building2 className="home-workspace-org-icon" size={18} aria-hidden="true" />
            Keep all your businesses under one organization and switch between them. Each location gets the full set.
          </p>
        </div>
        <ul className="home-workspace-grid">
          {WORKSPACE_MODULES.map(({ icon: Icon, title, text, tags, href }) => (
            <li key={title}>
              <Link href={href} className="home-workspace-card">
                <span className="home-workspace-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="home-workspace-tags">
                  {tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <div className="home-workspace-card home-workspace-card-cta">
              <h3>See it on your own business</h3>
              <p>Connect your Google profile and try every tool for 7 days.</p>
              <TrialTerms className="home-workspace-trial" />
              <Link
                href={SIGNUP_URL}
                className="marketing-button"
                data-track="trial"
                data-track-location="home-workspace"
              >
                Start free trial <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
