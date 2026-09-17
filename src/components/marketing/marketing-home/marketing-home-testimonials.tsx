import { Quote } from "lucide-react";
import { HOME_TESTIMONIALS } from "@/components/marketing/marketing-home/home-testimonials";

export function MarketingHomeTestimonials() {
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
        <div className="owner-stories-grid">
          {HOME_TESTIMONIALS.map((testimonial, index) => {
            const [before, after] = testimonial.quote.split(testimonial.highlight);
            return (
              <div
                key={testimonial.id}
                className={`owner-story-slot${index === 0 ? " owner-story-featured" : ""}`}
              >
                <div className="owner-story-card">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
