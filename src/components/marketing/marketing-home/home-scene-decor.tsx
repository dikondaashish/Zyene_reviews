import Image from "next/image";

export function HomeScenePlant({ position }: { position: "left" | "right" }) {
  return (
    <div className={`hero-plant hero-plant-${position}`} aria-hidden="true">
      <Image src="/marketing/home/hero-desk-plant.webp" alt="" fill sizes="(max-width:1199px) 0px, 220px" />
    </div>
  );
}

export function HomeSceneMug() {
  return (
    <div className="hero-mug" aria-hidden="true">
      <Image
        src="/marketing/home/hero-community-mug.webp"
        alt=""
        fill
        sizes="(max-width:1199px) 0px, 160px"
      />
    </div>
  );
}
