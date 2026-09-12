import Link from "next/link";

const STEPS = [
  { title: "Choose which reviews", description: "Reply to new, unanswered Google reviews rated 3 stars and up, 4 stars and up, or 5 stars only." },
  { title: "Make the tone yours", description: "Choose Professional, Friendly, or Concise to match the way your business speaks to customers." },
  { title: "Turn on automatic publishing", description: "Confirm your settings for the selected business. Eligible new reviews receive an AI reply, published directly to Google." },
];

export function AutomaticRepliesFeature() {
  return (
    <section className="marketing-section" aria-labelledby="automatic-replies-heading">
      <div className="marketing-container grid gap-12 lg:grid-cols-2">
        <div className="feature-detail-copy">
          <p className="marketing-eyebrow">Automatic Google replies</p>
          <h2 id="automatic-replies-heading">Your voice. Even when you’re busy.</h2>
          <p className="mt-5 text-muted-foreground">Give the next customer a thoughtful response while you take care of the people in front of you. Set your rating threshold and reply tone once, and let Zyene handle eligible new reviews.</p>
          <p className="mt-5 text-sm text-muted-foreground">When enabled, replies are published publicly without individual approval. Existing reviews are excluded. Turn it off anytime; replies already being processed may still finish.</p>
          <p className="mt-5 text-sm text-muted-foreground">Included on Starter, Professional, and Enterprise with an active subscription or trial. Business reply suggestions and automatic Google replies have no monthly quota. AI customer review drafts have a separate plan allowance.</p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm font-semibold"><Link href="/pricing" className="underline underline-offset-4">Compare plans</Link><Link href="/help/reviews/setting-up-auto-commenter" className="underline underline-offset-4">Read the setup guide</Link><Link href="/#home-product-tour" className="underline underline-offset-4">Try the interactive demo</Link></div>
        </div>
        <ol className="divide-y divide-border">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-5 py-6 first:pt-0">
              <span className="pt-1 text-sm font-medium text-primary" aria-hidden="true">0{index + 1}</span>
              <div><h3 className="text-xl font-semibold">{step.title}</h3><p className="mt-2 text-muted-foreground">{step.description}</p></div>
            </li>
          ))}
        </ol>
      </div>
      <div className="marketing-container mt-14">
        <h3 className="text-2xl font-semibold">Two ways to make a reply yours.</h3>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="border-t border-border pt-5"><h4 className="text-lg font-semibold">AI reply suggestions</h4><p className="mt-2 text-muted-foreground">Generate a draft, edit the details, then publish it to Google yourself. Useful when a review needs your personal attention.</p></div>
          <div className="border-t border-border pt-5"><h4 className="text-lg font-semibold">Automatic Google replies</h4><p className="mt-2 text-muted-foreground">Choose your tone and minimum star rating. Zyene writes and publishes replies to eligible new Google reviews for the selected business. Facebook and Yelp remain monitoring connections.</p></div>
        </div>
      </div>
    </section>
  );
}
