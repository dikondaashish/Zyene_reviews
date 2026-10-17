import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { HOME_FAQS } from "@/components/marketing/marketing-home/home-faqs";

/** FAQ answers match the FAQPage JSON-LD on this route word for word. */
export function MarketingHomeFaq() {
  return (
    <section className="marketing-section home-faq" aria-labelledby="home-faq-heading">
      <div className="marketing-container home-faq-grid">
        <div>
          <p className="marketing-eyebrow">FAQ</p>
          <h2 id="home-faq-heading">Questions, answered.</h2>
          <p className="home-section-lede">Something else on your mind?</p>
          <Link href="/contact" className="home-text-link" data-track="demo" data-track-location="closing">
            Talk to a real person <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="home-faq-list">
          {HOME_FAQS.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <Plus size={16} aria-hidden="true" />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MarketingHomeFinalCta() {
  return (
    <section className="home-final" aria-labelledby="home-final-heading">
      <div className="marketing-container">
        <div className="home-final-band">
          <div className="home-final-copy">
            <h2 id="home-final-heading">Your best customers are ready to talk about you.</h2>
            <p>Make it easy for them. Try Zyene free for 7 days and let the routine run itself.</p>
            <div className="home-final-actions">
              <Link href={SIGNUP_URL} className="marketing-button home-final-primary" data-track="trial" data-track-location="closing">
                Start free trial <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/demo" className="marketing-button home-final-secondary" data-track="demo" data-track-location="closing">
                Book a demo
              </Link>
            </div>
          </div>
          <div className="home-final-photo">
            <Image
              src="/marketing/home/cafe-owner-feedback-candid-v2.webp"
              alt="A café owner reading new customer feedback on a tablet behind the counter"
              fill
              sizes="(max-width: 1023px) 100vw, 520px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
