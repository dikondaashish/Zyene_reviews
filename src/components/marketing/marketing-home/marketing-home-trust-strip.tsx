import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrandLogoUrl } from "@/lib/marketing/integration-brands";

const PLATFORMS = [
  { name: "Google Business Profile", domain: "google.com" },
  { name: "Facebook", domain: "facebook.com" },
  { name: "Yelp", domain: "yelp.com" },
  { name: "Square", domain: "squareup.com" },
];

export function MarketingHomeTrustStrip() {
  return (
    <section className="home-platforms" aria-labelledby="home-platforms-heading">
      <div className="marketing-container home-platforms-row">
        <h2 id="home-platforms-heading">Connects to the places your customers already talk about you</h2>
        <ul>
          {PLATFORMS.map(({ name, domain }) => (
            <li key={domain}>
              <Image src={getBrandLogoUrl(domain)} alt="" width={28} height={28} unoptimized />
              <span>{name}</span>
            </li>
          ))}
        </ul>
        <Link href="/integrations" className="home-text-link">
          All integrations <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
