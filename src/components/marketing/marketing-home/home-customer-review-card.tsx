import Image from "next/image";

export function HomeCustomerReviewCard({ placement }: { placement: "top" | "bottom" }) {
  const top = placement === "top";
  return (
    <div className={`hero-floating-review hero-floating-review-${placement}`}>
      <div className="hero-review-card">
        <span className="hero-review-avatar">
          <Image
            src={top ? "/marketing/home/customer-avatar.png" : "/marketing/home/alert-robert-hayes.png"}
            alt=""
            fill
            sizes="(max-width: 767px) 40px, 70px"
          />
        </span>
        <div>
          <span className="hero-rating" aria-label="5 out of 5 stars">
            ★★★★★
          </span>
          <p>
            {top ? (
              <>
                “Fantastic experience!
                <br />
                Will be back!”
              </>
            ) : (
              <>
                “Super easy to use
                <br />
                and very effective!”
              </>
            )}
          </p>
          <small>{top ? "Example customer review" : "Illustrative product feedback"}</small>
        </div>
      </div>
      {top && (
        <svg
          className="hero-review-rays"
          viewBox="0 0 45 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m10 22 14-18M16 37l24-8M17 51l20 10" />
        </svg>
      )}
    </div>
  );
}
