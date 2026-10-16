import Image from "next/image";
import { Check } from "lucide-react";
import type { StoryMedia, StoryRow } from "@/components/marketing/feature-landing/types";

function RowMedia({ media }: { media: StoryMedia }) {
  if (media.kind === "visual") {
    return (
      <figure className="fl-row-visual" aria-label={media.label}>
        {media.node}
      </figure>
    );
  }
  return (
    <div className="fl-row-photo">
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes="(max-width: 900px) 100vw, 50vw"
        style={media.objectPosition ? { objectPosition: media.objectPosition } : undefined}
      />
      {media.overlay && <div className="fl-row-overlay">{media.overlay}</div>}
    </div>
  );
}

/** Alternating photo / product-mock rows with the detail behind each part of the feature. */
export function FeatureLandingRows({ rows }: { rows: StoryRow[] }) {
  return (
    <section className="marketing-section fl-rows">
      <div className="marketing-container fl-rows-stack">
        {rows.map((row, index) => (
          <article key={row.title} className={`fl-row${index % 2 ? " fl-row-reverse" : ""}`}>
            <RowMedia media={row.media} />
            <div className="fl-row-copy">
              <p className="marketing-eyebrow">{row.eyebrow}</p>
              <h2>{row.title}</h2>
              <p>{row.text}</p>
              <ul>
                {row.points.map((point) => (
                  <li key={point}>
                    <Check size={16} aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
