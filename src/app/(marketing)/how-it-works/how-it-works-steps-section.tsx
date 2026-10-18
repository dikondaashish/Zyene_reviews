import Image from "next/image";
import { Check } from "lucide-react";
import { ReviewDemo } from "@/components/marketing/product-tour/review-demo";
import { RequestDemo } from "@/components/marketing/product-tour/request-demo";
import { ReportDemo } from "@/components/marketing/product-tour/report-demo";
import { STEPS } from "@/app/(marketing)/how-it-works/how-it-works-data";

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="story-visual" data-reveal>
        <Image
          src="/marketing/home/cafe-conversation.webp"
          alt="A barista and customer talking across a café counter"
          fill
          sizes="(max-width: 1023px) 100vw, 55vw"
        />
      </div>
    );
  }
  return (
    <div className="workflow-product product-tour" data-reveal>
      {index === 1 ? <ReviewDemo /> : index === 2 ? <RequestDemo /> : <ReportDemo />}
    </div>
  );
}

export function HowItWorksStepsSection() {
  return (
    <>
      {STEPS.map((step, index) => (
        <section
          key={step.step}
          id={`step-${step.step}`}
          className="marketing-section hiw-step"
          aria-labelledby={`step-${step.step}-heading`}
        >
          <div className="marketing-container mi-split">
            <div className="mi-head">
              <p className="marketing-eyebrow">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </p>
              <h2 id={`step-${step.step}-heading`}>{step.headline}</h2>
              <p>{step.description}</p>
            </div>
            <div className="hiw-step-body">
              <StepVisual index={index} />
              <ul className="mi-list">
                {step.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={18} aria-hidden="true" />
                    <p className="mi-list-title">{bullet}</p>
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
