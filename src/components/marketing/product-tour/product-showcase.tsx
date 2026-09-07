import { ProductTour, type ProductTourTab } from "@/components/marketing/product-tour/product-tour";

export function ProductShowcase({
  title = "Take a look around.",
  description = "Explore a sample review inbox, try a reply tone, and see how review requests and reporting fit together.",
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
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Interactive product example with fictional data. No messages or replies are sent.
        </p>
      </div>
    </section>
  );
}
