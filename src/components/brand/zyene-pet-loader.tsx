import Image from "next/image";

export function ZyenePetLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center gap-3 text-muted-foreground"
    >
      <div aria-hidden="true" className="relative flex h-24 w-20 justify-center">
        <Image
          src="/brand/mascot/zyene-mascot-master-v1.png"
          alt=""
          width={80}
          height={80}
          sizes="80px"
          loading="eager"
          className="zyene-pet-loader-mascot size-20 object-contain"
        />
        <span className="zyene-pet-loader-shadow absolute bottom-1 h-1 w-8 rounded-full bg-primary/15" />
      </div>
      <div aria-hidden="true" className="flex gap-1.5">
        <span className="zyene-pet-loader-dot size-1 rounded-full bg-primary" />
        <span className="zyene-pet-loader-dot size-1 rounded-full bg-primary" />
        <span className="zyene-pet-loader-dot size-1 rounded-full bg-primary" />
      </div>
      <p className="text-sm">Loading…</p>
    </div>
  );
}
