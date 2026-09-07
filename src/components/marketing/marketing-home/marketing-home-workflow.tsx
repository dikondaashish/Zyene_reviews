import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const STORIES = [
  {
    title: "You make their day. Make it easy to share.",
    label: "01 / GET MORE REVIEWS",
    text: "The best time to ask is while a great experience is still fresh. Reach customers with a personal review request by text, email, or a quick scan.",
    image: "/marketing/home/cafe-service.webp",
    alt: "A barista serving iced coffee across a café counter",
    href: "/features/review-collection",
    link: "Make every visit count",
    features: ["SMS & email requests", "QR codes & review links"],
  },
  {
    title: "A personal reply. Without the blank page.",
    label: "02 / KEEP THE CONVERSATION GOING",
    text: "Good feedback deserves more than silence. Bring your reviews together, find the right words with AI, and add the human touch only you can.",
    image: "/marketing/home/cafe-conversation.webp",
    alt: "A barista listening to a customer at a café counter",
    href: "/features/ai-replies",
    link: "Find your voice, faster",
    features: ["AI reply suggestions", "Your tone, your final say"],
  },
  {
    title: "Your reputation has a story. See the whole picture.",
    label: "03 / GROW WITH CLARITY",
    text: "Understand what customers value, keep an eye on local competitors, and give every location a clear view of what’s working.",
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
            Your good work.
            <br />
            More people talking about it.
          </h2>
          <p>
            Less time chasing reviews.
            <br />
            More time doing what you do best.
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
