import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, Mail, MessageSquare, Printer, QrCode } from "lucide-react";
import { NFC_CARD } from "@/lib/nfc/catalog";

const NFC_PRICE = `$${(NFC_CARD.unitAmountCents / 100).toFixed(2)}`;

export function HomeJourneyInStore() {
  return (
    <div className="home-journey-cards">
      <article className="home-journey-card">
        <div className="home-journey-qr" aria-hidden="true">
          <QrCode size={64} strokeWidth={1.4} />
        </div>
        <h3>Your QR code, ready to print</h3>
        <p>Download it or print a table poster straight from your dashboard. Every scan opens your review page.</p>
        <div className="home-journey-chips">
          <span><Printer size={13} aria-hidden="true" />Print</span>
          <span><Download size={13} aria-hidden="true" />Download</span>
        </div>
        <Link href="/features/qr-code-reviews" className="home-journey-link">
          Review QR codes <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </article>
      <article className="home-journey-card home-journey-card-nfc">
        <div className="home-journey-nfc-image">
          <Image
            src={NFC_CARD.imageSrc}
            alt="Two NFC review stands, one black and one white, each with a Google logo and a QR code"
            fill
            sizes="(max-width: 767px) 100vw, 30vw"
          />
        </div>
        <h3>NFC review stands</h3>
        <p>
          Customers tap their phone or scan the code on the stand. Order them inside the app for {NFC_PRICE} each, shipped
          to your door.
        </p>
        <Link href="/features/nfc-review-stands" className="home-journey-link">
          NFC review stands <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </article>
      <article className="home-journey-card">
        <div className="home-journey-chips home-journey-chips-lead" aria-hidden="true">
          <span><MessageSquare size={13} />SMS</span>
          <span><Mail size={13} />Email</span>
          <span>Both</span>
        </div>
        <h3>Or send the link after the visit</h3>
        <p>
          Send one request or a campaign to your customer list, preview the message first, and add reminders on day 7
          and day 14.
        </p>
        <Link href="/features/review-requests" className="home-journey-link">
          SMS & email requests <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </article>
    </div>
  );
}
