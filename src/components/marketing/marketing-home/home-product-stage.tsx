import Image from "next/image";
import { Lock } from "lucide-react";
import { ProductTour } from "@/components/marketing/product-tour/product-tour";

/** The real interactive product tour in a browser window, set over a soft café backdrop. */
export function HomeProductStage() {
  return (
    <div id="home-product-tour" className="marketing-container home-stage">
      <div className="home-stage-backdrop" aria-hidden="true">
        <Image
          src="/marketing/home/hero-cafe-backdrop.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1240px) 100vw, 1240px"
        />
      </div>
      <div className="home-stage-window tour-tablet" role="region" aria-label="Interactive Zyene Reviews workspace">
        <div className="home-stage-chrome" aria-hidden="true">
          <span className="home-stage-lights"><i /><i /><i /></span>
          <span className="home-stage-url"><Lock size={11} />app.zyenereviews.com</span>
        </div>
        <div className="tour-tablet-screen">
          <ProductTour />
        </div>
      </div>
    </div>
  );
}
