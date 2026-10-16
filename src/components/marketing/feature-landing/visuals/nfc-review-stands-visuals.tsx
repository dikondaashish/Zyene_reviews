import Image from "next/image";
import { Check, ChevronLeft, Lock, Minus, Plus } from "lucide-react";
import { MockCaption, MockPill, MockWindow } from "@/components/marketing/feature-landing/visuals/mock-primitives";

const FEATURES = [
  "Pre-linked to the Corner Café review page",
  "Works on iPhone and Android, nothing to install",
  "Countertop stand for counters, desks and tables",
];

/** The in-app product step: photo, price, features and the quantity stepper. */
export function NfcStandsHeroVisual() {
  return (
    <div className="mk-stack">
      <MockWindow title="Order an NFC review stand">
        <div className="vz-nfc-order">
          <div className="vz-nfc-media">
            <Image src="/nfc/review-stand.jpg" alt="" fill sizes="(max-width: 600px) 80vw, 220px" />
          </div>
          <div className="mk-stack">
            <div className="mk-wrap">
              <MockPill tone="brand">NFC + QR</MockPill>
              <small className="vz-nfc-muted">Ships to US &amp; Canada</small>
            </div>
            <b className="vz-nfc-title">NFC Review Stand</b>
            <span className="vz-nfc-price">$4.99 <small>each</small></span>
            <ul className="vz-nfc-list">
              {FEATURES.map((feature) => (
                <li key={feature}><Check size={13} />{feature}</li>
              ))}
            </ul>
            <div className="vz-nfc-buy">
              <span className="vz-nfc-stepper"><Minus size={13} /><b>3</b><Plus size={13} /></span>
              <span className="mk-button">Add to cart · $14.97</span>
            </div>
          </div>
        </div>
      </MockWindow>
      <MockCaption>Order screen shown for a fictional café.</MockCaption>
    </div>
  );
}

const SHIPPING = [
  { name: "Standard shipping", eta: "5-8 business days", price: "$4.99", selected: true },
  { name: "Expedited shipping", eta: "2-3 business days", price: "$6.99", selected: false },
];

/** The cart step: delivery speed, totals and the Stripe hand-off. */
export function NfcStandsCartVisual() {
  return (
    <div className="mk-stack vz-nfc-cart">
      <div className="vz-nfc-sheet" aria-hidden="true">
        <span className="vz-nfc-back"><ChevronLeft size={13} /> Back to stand</span>
        <div className="vz-nfc-item">
          <span className="vz-nfc-thumb">
            <Image src="/nfc/review-stand.jpg" alt="" fill sizes="44px" />
          </span>
          <div>
            <b>NFC Review Stand</b>
            <small>3 NFC stands · $4.99 each</small>
          </div>
          <b className="vz-nfc-amt">$14.97</b>
        </div>
        <span className="mk-label">Delivery speed</span>
        {SHIPPING.map((option) => (
          <div key={option.name} className={`vz-nfc-ship${option.selected ? " is-selected" : ""}`}>
            <i />
            <div>
              <b>{option.name}</b>
              <small>{option.eta}</small>
            </div>
            <span>{option.price}</span>
          </div>
        ))}
        <dl className="vz-nfc-totals">
          <div><dt>Subtotal</dt><dd>$14.97</dd></div>
          <div><dt>Shipping</dt><dd>$4.99</dd></div>
          <div className="is-total"><dt>Total</dt><dd>$19.96</dd></div>
        </dl>
        <span className="mk-button">Pay $19.96 with Stripe</span>
        <small className="vz-nfc-secure"><Lock size={11} /> Card and address are entered on Stripe’s checkout</small>
      </div>
      <MockCaption>Example order of three stands.</MockCaption>
    </div>
  );
}
