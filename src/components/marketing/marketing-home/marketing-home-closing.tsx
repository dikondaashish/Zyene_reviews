import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { SIGNUP_URL } from "@/config/env";
import { HOME_FAQS } from "@/components/marketing/marketing-home/home-faqs";

export function MarketingHomeClosing() {
  return (
    <>
      <section className="marketing-section">
        <div className="marketing-container grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="marketing-eyebrow">A little more clarity</p>
            <h2 className="text-4xl lg:text-5xl">
              Good questions.
              <br />
              Straight answers.
            </h2>
            <p className="mt-6 text-muted-foreground">Something else on your mind?</p>
            <Link href="/contact" className="mt-2 inline-flex items-center gap-3 text-sm font-semibold">
              Talk to a real person <ArrowRight size={16} />
            </Link>
          </div>
          <div>
            {HOME_FAQS.map((faq) => (
              <details key={faq.question} className="group border-b border-border py-5 first:border-t">
                <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-6 font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="max-w-[65ch] pt-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full pb-20">
        <div className="brand-moment">
          <div>
            <h2>
              Great experiences
              <br />
              deserve to be shared.
            </h2>
            <p>Let’s help more people discover what makes your business worth coming back to.</p>
            <Link href={SIGNUP_URL} className="marketing-button">
              Make your next move <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="brand-moment-photo">
            <Image
              src="/marketing/home/cafe-service.webp"
              alt="A smiling barista serving coffee across a café counter"
              fill
              sizes="(max-width:767px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>
    </>
  );
}
