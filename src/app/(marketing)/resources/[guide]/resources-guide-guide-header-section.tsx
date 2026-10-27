import Link from "next/link";
import { Clock } from "lucide-react";
import { resourceImage } from "@/components/marketing/resource-imagery";
import { LandingHero } from "@/components/marketing/landing-hero";
import { RESOURCE_MAP } from "@/lib/content/resource-data";

export function ResourcesGuideGuideHeaderSection({ resource }: { resource: (typeof RESOURCE_MAP)[string] }) {
    const image = resourceImage(resource.slug);
    const updatedDate = resource.dateModified ?? resource.lastUpdated;
    const updated = new Date(updatedDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return (
        <LandingHero
            eyebrow={resource.resourceLabel ?? "Free guide"}
            title={resource.title}
            description={resource.subtitle}
            image={image}
        >
            <p className="mi-read-meta">
                <Link href="/resources">All resources</Link>
                <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} aria-hidden="true" /> {resource.readMinutes} min read
                </span>
                <span>Last updated: {updated}</span>
            </p>
        </LandingHero>
    );
}
