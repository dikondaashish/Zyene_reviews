import { Lock } from "lucide-react";
import { ProductTour, type ProductTourTab } from "@/components/marketing/product-tour/product-tour";

/** The real interactive product tour in the homepage's browser window, on a quiet panel. */
export function FeatureLandingStage({ label, initialTab, caption }: { label: string; initialTab?: ProductTourTab; caption?: string }) {
  return (
    <figure className="fl-stage">
      <div className="fl-stage-panel">
        <div className="home-stage-window tour-tablet" role="region" aria-label={label}>
          <div className="home-stage-chrome" aria-hidden="true">
            <span className="home-stage-lights"><i /><i /><i /></span>
            <span className="home-stage-url"><Lock size={11} />app.zyenereviews.com</span>
          </div>
          <div className="tour-tablet-screen">
            <ProductTour initialTab={initialTab} />
          </div>
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
