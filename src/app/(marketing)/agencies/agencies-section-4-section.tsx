import { AgencyWaitlistForm } from "@/components/marketing/agency-waitlist-form";
import { AGENCY_DASHBOARD_ROADMAP } from "@/lib/enterprise/agency-pricing-data";

export function AgenciesSection4Section() {
    return (
        <section className="marketing-section" aria-labelledby="agencies-dashboard-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <span className="mi-pill">{AGENCY_DASHBOARD_ROADMAP.status}</span>
                    <h2 id="agencies-dashboard-heading">{AGENCY_DASHBOARD_ROADMAP.title}</h2>
                    <p>{AGENCY_DASHBOARD_ROADMAP.description}</p>
                </div>
                <div className="mi-panel">
                    <h3>Join the beta waitlist</h3>
                    <div className="agencies-waitlist">
                        <AgencyWaitlistForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
