import { getIndustryImage } from "@/lib/industries/industry-imagery";

/** Spanish alt text for the shared industry photos (provenance: docs/marketing-photography.md). */
const ES_PHOTO_ALT: Record<string, string> = {
  restaurants: "Comensales compartiendo una comida y conversando en un restaurante",
  dental: "Equipo dental preparando instrumentos junto a un sillón de tratamiento vacío",
  "home-services": "Un técnico instalando el marco de una ventana con un taladro inalámbrico",
  salons: "Estilista peinando el cabello de una clienta en un salón de barrio",
  "auto-repair": "Mecánico trabajando con herramientas bajo el capó abierto de un auto",
  medical: "Recepcionista de una clínica recibiendo a un visitante en la sala de espera",
  hotels: "Recepcionista de hotel recibiendo a un huésped con equipaje en la recepción",
  fitness: "Entrenador conversando con un miembro del gimnasio junto a un estante de mancuernas",
};

export function getEsIndustryImage(industrySlug: string, name: string) {
  const photo = getIndustryImage(industrySlug, name);
  return { src: photo.src, alt: ES_PHOTO_ALT[industrySlug] ?? name };
}
