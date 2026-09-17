"use client";

import { ProductTour, type ProductTourTab } from "@/components/marketing/product-tour/product-tour";
import { TabletDemo } from "@/components/marketing/product-tour/tablet-demo";
import { TourStoryCopy } from "@/components/marketing/product-tour/tour-story-copy";
import { useTourStory } from "@/components/marketing/product-tour/use-tour-story";

export function ProductShowcase({
  title = "Take a look around.",
  description = "A little less work. A lot more clarity.",
  initialTab = "reviews",
}: {
  title?: string;
  description?: string;
  initialTab?: ProductTourTab;
}) {
  const { section, progressBar, active, setActive } = useTourStory(initialTab);
  return (
    <section ref={section} className="product-tour-section tour-story-section" aria-label="Explore the Zyene Reviews demo">
      <div className="tour-story-pin">
        <div className="marketing-container tour-story-layout">
          <div className="tour-story-narrative">
            <p className="marketing-eyebrow">{description}</p>
            <h2>{title}</h2>
            <TourStoryCopy active={active} onChange={setActive} />
            <div className="tour-story-progress" aria-hidden="true"><span ref={progressBar} /></div>
          </div>
          <TabletDemo>
            <ProductTour initialTab={initialTab} activeTab={active} onTabChange={setActive} />
          </TabletDemo>
        </div>
      </div>
    </section>
  );
}
