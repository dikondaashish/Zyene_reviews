"use client";

import { m, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { MarketingAnimation } from "@/components/marketing/marketing-animation";
import { MarketingTilt } from "@/components/marketing/marketing-tilt";
import { HOME_TESTIMONIALS } from "@/components/marketing/marketing-home/home-testimonials";

export function MarketingHomeTestimonials() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="testimonials" className="marketing-section owner-stories" aria-labelledby="owner-stories-heading">
      <div className="marketing-container">
        <div className="owner-stories-heading">
          <p className="marketing-eyebrow">In their own words</p>
          <h2 id="owner-stories-heading">
            Loved by local
            <br />
            <span>business owners.</span>
          </h2>
        </div>
        <MarketingAnimation>
          <div className="owner-stories-grid">
            {HOME_TESTIMONIALS.map((testimonial, index) => {
              const [before, after] = testimonial.quote.split(testimonial.highlight);
              return (
                <m.div
                  key={testimonial.id}
                  className={`owner-story-slot${index === 0 ? " owner-story-featured" : ""}`}
                  initial={false}
                  whileInView={
                    reducedMotion
                      ? undefined
                      : { opacity: [0.65, 1], transform: ["translateY(20px)", "translateY(0px)"] }
                  }
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MarketingTilt className="owner-story-card">
                    <figure>
                      <div className="owner-story-topline">
                        <span>{testimonial.industry}</span>
                        <Quote size={28} aria-hidden="true" />
                      </div>
                      <blockquote>
                        <p>
                          {before}
                          <strong>{testimonial.highlight}</strong>
                          {after}
                        </p>
                      </blockquote>
                      <figcaption>
                        <span className="owner-story-avatar" aria-hidden="true">
                          {testimonial.initials}
                        </span>
                        <span className="owner-story-author">
                          <strong>{testimonial.name}</strong>
                          <span>
                            {testimonial.role}, {testimonial.business}
                          </span>
                        </span>
                      </figcaption>
                    </figure>
                  </MarketingTilt>
                </m.div>
              );
            })}
          </div>
        </MarketingAnimation>
      </div>
    </section>
  );
}
