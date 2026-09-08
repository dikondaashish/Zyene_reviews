import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const STORIES = [
  {
    title: "Ask once. Follow up thoughtfully. Keep it moving.",
    label: "01 / INVITE FEEDBACK",
    text: "Set a branded review request for the right moment after a visit or completed service. Reach customers by text, email, link, or QR code, then add an optional reminder when they have not engaged.",
    image: "/marketing/home/cafe-service.webp",
    alt: "A barista serving iced coffee across a café counter",
    href: "/features/review-collection",
    link: "Make every visit count",
    features: ["SMS, email, links & QR codes", "Optional follow-up reminders"],
  },
  {
    title: "A thoughtful reply. Without the blank page.",
    label: "02 / RESPOND WITH CARE",
    text: "Bring Google, Facebook, and Yelp feedback into one working view. Let AI get the first draft started, then add the human context only your team can provide before you publish to Google.",
    image: "/marketing/home/cafe-conversation.webp",
    alt: "A barista listening to a customer at a café counter",
    href: "/features/ai-replies",
    link: "Find your voice, faster",
    features: ["AI reply suggestions", "Your tone, your final say"],
  },
  {
    title: "Your reputation has a story. See the next move.",
    label: "03 / LEARN WITH CLARITY",
    text: "See request activity, rating and response trends, local competitor context, and the feedback that deserves a closer look—then improve the experience that comes next.",
    image: "/marketing/about/team-collaboration.png",
    alt: "A business team reviewing its work together",
    href: "/features/analytics",
    link: "See what’s moving your business",
    features: ["Location-level reporting", "Competitor insights"],
  },
];

export function MarketingHomeWorkflow() {
  return (
    <section id="features" className="marketing-section">
      <div className="marketing-container">
        <div className="marketing-section-heading">
          <h2>
            A review routine
            <br />
            that keeps working.
          </h2>
          <p>
            Invite feedback.
            <br />
            Respond with care. Learn quickly.
          </p>
        </div>
        {STORIES.map((story, index) => (
          <article className={`story-row ${index % 2 ? "story-row-reverse" : ""}`} key={story.href}>
            <div className="story-visual" data-reveal>
              <Image src={story.image} alt={story.alt} fill sizes="(max-width:767px) 100vw, 45vw" />
            </div>
            <div className="story-copy">
              <span className="story-index">{story.label}</span>
              <h3>{story.title}</h3>
              <p>{story.text}</p>
              <Link href={story.href}>
                {story.link}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <div className="story-features">
                {story.features.map((feature) => (
                  <span key={feature}>
                    <Check size={14} aria-hidden="true" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
