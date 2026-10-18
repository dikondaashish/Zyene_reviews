import { Briefcase, Plug, Users } from "lucide-react";

const PARTNER_TYPES = [
    { icon: Briefcase, title: "Agencies and consultants", text: "Manage reviews for the local businesses you support. Discuss client access, location limits, and reporting with us." },
    { icon: Plug, title: "Software and service providers", text: "Use the API or a supported automation connection to request feedback after a completed job or visit." },
    { icon: Users, title: "Local business communities", text: "Help members understand review collection, replies, and private feedback with practical product walkthroughs." },
] as const;

export function PartnersTypesSection() {
    return (
        <section className="marketing-section" aria-labelledby="partners-types-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Partner programs</p>
                    <h2 id="partners-types-heading">Find the right way to work together</h2>
                </div>
                <ul className="mi-cards">
                    {PARTNER_TYPES.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="mi-card">
                            <Icon size={20} aria-hidden="true" />
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
