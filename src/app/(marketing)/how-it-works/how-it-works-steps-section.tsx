import Image from "next/image";
import { Check } from "lucide-react";
import { ReviewDemo } from "@/components/marketing/product-tour/review-demo";
import { RequestDemo } from "@/components/marketing/product-tour/request-demo";
import { ReportDemo } from "@/components/marketing/product-tour/report-demo";
import { STEPS } from "@/app/(marketing)/how-it-works/how-it-works-data";

export function HowItWorksStepsSection() {
  return (
    <>
      {STEPS.map((step, index) => (
        <section key={step.step} id={`step-${step.step}`} className={`marketing-section ${index % 2 ? "bg-muted" : ""}`}>
          <div className={`marketing-container story-row ${index % 2 ? "story-row-reverse" : ""}`}>
            <div className={index === 0 ? "story-visual" : "workflow-product"} data-reveal>
              {index === 0 ? (
                <Image
                  src="/marketing/home/cafe-conversation.webp"
                  alt="A barista and customer talking across a café counter"
                  fill
                  sizes="(max-width: 767px) 100vw, 45vw"
                />
              ) : index === 1 ? (
                <ReviewDemo />
              ) : index === 2 ? (
                <RequestDemo />
              ) : (
                <ReportDemo />
              )}
            </div>
            <div className="feature-detail-copy">
              <p className="marketing-eyebrow">
                {step.step} / {step.title}
              </p>
              <h2>{step.headline}</h2>
              <p className="mt-6 text-muted-foreground">{step.description}</p>
              <ul className="feature-detail-list">
                {step.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={17} aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
