import { ZyenePetLoader } from "@/components/brand/zyene-pet-loader";

export default function Loading() {
  return (
    <main data-app-palette className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <ZyenePetLoader />
    </main>
  );
}
