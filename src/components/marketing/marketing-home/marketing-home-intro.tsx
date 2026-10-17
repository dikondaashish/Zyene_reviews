import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { HomeProductStage } from "@/components/marketing/marketing-home/home-product-stage";

/** Sits under the hero scene: the short promise, then the real interactive product tour. */
export function MarketingHomeIntro() {
  return (
    <section className="home-intro" aria-labelledby="home-intro-title">
      <div className="marketing-container home-intro-grid">
        <h2 id="home-intro-title" className="home-intro-headline">
          <span>More Google reviews.</span> <span>Less busywork.</span>
        </h2>
        <div className="home-intro-aside">
          <p className="home-intro-lede">
            Send review requests by text and email, reply to every Google review with AI, and see what customers keep
            saying. All in one workspace.
          </p>
          <div className="home-intro-actions">
            <Link href={SIGNUP_URL} className="marketing-button" data-track="trial" data-track-location="intro">
              Start free trial <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/demo" className="marketing-button marketing-button-secondary" data-track="demo" data-track-location="intro">
              Book a demo
            </Link>
          </div>
          <p className="home-intro-terms">7-day free trial, card required. Plans from $29.99/month. Cancel anytime in Billing.</p>
        </div>
      </div>
      <HomeProductStage />
    </section>
  );
}
