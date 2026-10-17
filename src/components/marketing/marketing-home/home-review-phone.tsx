"use client";

import Image from "next/image";
import { useState } from "react";
import { BatteryFull, Check, Signal, Star, Wifi } from "lucide-react";
import { ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";

export function HomeReviewPhone() {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="hero-phone-enter">
      <div className="hero-phone-float">
        <div className="hero-phone" data-interacted={rating !== null || submitted}>
          <div className="hero-phone-status" aria-hidden="true">
            <span>9:41</span>
            <span>
              <Signal />
              <Wifi />
              <BatteryFull />
            </span>
          </div>
          <span className="hero-phone-notch" aria-hidden="true" />
          <div className="hero-phone-content">
            <Image src={ZYENE_REVIEWS_LOGO_SRC} alt="Zyene Reviews" width={42} height={42} />
            <p className="hero-phone-brand">
              <b>Zyene</b> Reviews
            </p>
            <p className="hero-phone-question">
              {submitted ? (
                <>
                  Thanks for
                  <br />
                  your feedback!
                </>
              ) : (
                <>
                  How was your
                  <br />
                  experience?
                </>
              )}
            </p>
            {submitted ? (
              <div className="hero-phone-success" role="status">
                <Check aria-hidden="true" />
                <span>
                  Your {rating}-star demo rating was saved.
                  <br />
                  Nothing was sent.
                </span>
              </div>
            ) : (
              <>
                <fieldset className="hero-phone-stars">
                  <legend className="sr-only">Try a rating in this review example</legend>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="hero-demo-rating"
                        value={value}
                        checked={rating === value}
                        onChange={() => setRating(value)}
                        aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      />
                      <Star
                        className={rating !== null && value <= rating ? "is-filled" : undefined}
                        aria-hidden="true"
                        style={{ animationDelay: `${1700 + value * 100}ms` }}
                      />
                    </label>
                  ))}
                </fieldset>
                <p className="hero-phone-rating-status" aria-live="polite">
                  {rating === null ? "Choose a rating to continue" : `${rating} ${rating === 1 ? "star" : "stars"} selected`}
                </p>
                <button
                  type="button"
                  className="hero-phone-submit"
                  disabled={rating === null}
                  onClick={() => {
                    if (rating === null) return;
                    setSubmitted(true);
                  }}
                >
                  Leave a review
                </button>
                <p className="hero-phone-minute">It only takes a minute.</p>
              </>
            )}
            <span className="hero-phone-demo">Interactive example</span>
            {submitted && (
              <button
                className="hero-phone-reset"
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setRating(null);
                }}
              >
                Try again
              </button>
            )}
          </div>
          <span className="hero-phone-home" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
