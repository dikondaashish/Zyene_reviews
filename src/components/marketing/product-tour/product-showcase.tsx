import { ProductTour, type ProductTourTab } from "@/components/marketing/product-tour/product-tour";

export function ProductShowcase({
  title = "Take a look around.",
  description = "Pick a review. Make a reply your own. Send a sample request and explore the results. Go ahead, it’s all safe to try.",
  initialTab = "reviews",
}: {
  title?: string;
  description?: string;
  initialTab?: ProductTourTab;
}) {
  return (
    <section className="marketing-section bg-muted">
      <div className="marketing-container">
        <div className="marketing-section-heading">
          <div>
            <p className="marketing-eyebrow">A little less work. A lot more clarity.</p>
            <h2>{title}</h2>
          </div>
          <p>{description}</p>
        </div>
        <div className="product-showcase-frame">
          <ProductTour initialTab={initialTab} />
        </div>
      </div>
    </section>
  );
}
