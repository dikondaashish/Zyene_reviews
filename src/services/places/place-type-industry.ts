/**
 * Google place types (Places API "primaryType" / "types") to Zyene's industry tiles. Only clear
 * matches count: a business we can't place returns null, so the owner picks the tile themselves
 * instead of being told Google "detected" Other.
 */
const EXACT: Record<string, string> = {
    cafe: "coffee", coffee_shop: "coffee", tea_house: "coffee", cafeteria: "coffee",
    hair_salon: "salon", beauty_salon: "salon", barber_shop: "salon", nail_salon: "salon", hair_care: "salon", beautician: "salon",
    dentist: "dental", dental_clinic: "dental",
    gym: "gym", fitness_center: "gym", yoga_studio: "gym", pilates_studio: "gym",
    spa: "spa", massage: "spa", wellness_center: "spa", sauna: "spa",
    lodging: "hotel", hotel: "hotel", motel: "hotel", bed_and_breakfast: "hotel", resort_hotel: "hotel", inn: "hotel", guest_house: "hotel", hostel: "hotel",
    car_repair: "automotive", car_dealer: "automotive", car_wash: "automotive", auto_parts_store: "automotive", tire_shop: "automotive",
    doctor: "healthcare", hospital: "healthcare", medical_clinic: "healthcare", medical_lab: "healthcare", pharmacy: "healthcare",
    physiotherapist: "healthcare", chiropractor: "healthcare", veterinary_care: "healthcare", drugstore: "healthcare",
    restaurant: "restaurant", meal_takeaway: "restaurant", meal_delivery: "restaurant", bakery: "restaurant", food_court: "restaurant",
    bar: "restaurant", bar_and_grill: "restaurant", pub: "restaurant", diner: "restaurant", deli: "restaurant",
    shopping_mall: "retail", department_store: "retail", market: "retail", supermarket: "retail", grocery_store: "retail",
};

function industryForType(type: string): string | null {
    if (EXACT[type]) return EXACT[type];
    if (type.endsWith("_restaurant")) return "restaurant";
    if (type.endsWith("_store") || type.endsWith("_shop")) return "retail";
    return null;
}

/** The business's own primary type decides first; its other types only when that one is unclear. */
export function industryFromPlaceTypes(primaryType: string | null | undefined, types: readonly string[] = []): string | null {
    for (const type of [primaryType, ...types]) {
        const industry = type ? industryForType(type) : null;
        if (industry) return industry;
    }
    return null;
}
