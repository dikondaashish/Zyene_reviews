import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { ProductTour } from "@/components/marketing/product-tour/product-tour";

export function MarketingHomeHero() {
  return (
    <section className="marketing-home-hero">
      <div className="marketing-container">
        <div className="home-hero-copy marketing-reveal">
          <p className="marketing-eyebrow">Big love for local businesses</p>
          <h1>
            Happy customers.
            <br />
            <span>Your next big thing.</span>
          </h1>
          <p>
            Turn great experiences into more reviews, thoughtful replies, and a reputation that brings people through your door.
          </p>
          <div className="marketing-actions">
            <Link href={SIGNUP_URL} className="marketing-button">
              Start your free trial <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/demo" className="marketing-button marketing-button-secondary">
              Let’s show you around <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="marketing-home-note">
            <Check className="size-3.5" aria-hidden="true" />7 days free. Plans from $29.99/month.
          </p>
        </div>
        <div className="home-visual-stage marketing-reveal" style={{ animationDelay: "120ms" }}>
          <div className="home-visual-photo">
            <Image
              src="/marketing/home/cafe-service.webp"
              alt="A smiling barista handing an iced coffee to a customer"
              fill
              priority
              sizes="(max-width:1023px) 100vw, 32vw"
            />
          </div>
          <ProductTour />
        </div>
        <div className="home-visual-caption">
          <span>A real feel for your everyday workflow. Explore the interactive example.</span>
          <a href="#features" className="inline-flex items-center gap-2">
            Meet your new everyday advantage <ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
