import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";

type ClosingProps = { title: string; text?: string; location: string };

/** Closing band shared by /features and every feature page: the homepage's orange band, without the photo. */
export function FeatureLandingClosing({ title, text = "Try Zyene free for 7 days. Plans start at $29.99 a month.", location }: ClosingProps) {
  return (
    <section className="home-final" aria-labelledby="fl-final-heading">
      <div className="marketing-container">
        <div className="home-final-band fl-final-band">
          <div className="home-final-copy">
            <h2 id="fl-final-heading">{title}</h2>
            <p>{text}</p>
          </div>
          <div className="home-final-actions">
            <Link href={SIGNUP_URL} className="marketing-button home-final-primary" data-track="trial" data-track-location={location}>
              Start free trial <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="marketing-button home-final-secondary">
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
