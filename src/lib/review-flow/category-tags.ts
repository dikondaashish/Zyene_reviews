/** Default review-flow tag pills per business category (emoji + label). */
export const CATEGORY_TAGS: Record<string, string[]> = {
    restaurant: ["🍽️ Food", "👨‍🍳 Service", "✨ Ambiance", "💰 Prices", "🍕 Portions", "⚡ Speed", "🧹 Cleanliness", "📋 Menu Variety"],
    cafe: ["☕ Coffee", "🍰 Food", "✨ Ambiance", "👨‍🍳 Service", "💰 Prices", "📶 Wi-Fi", "💺 Seating"],
    bar: ["🍸 Drinks", "🎵 Atmosphere", "👨‍🍳 Service", "🎶 Music", "💰 Prices", "🍕 Food", "👥 Crowd"],
    salon: ["💇 Service", "✨ Skill", "🧹 Cleanliness", "💆 Ambiance", "💰 Prices", "🧴 Products", "😌 Relaxation"],
    spa: ["💆 Service", "😌 Relaxation", "🧹 Cleanliness", "✨ Ambiance", "🧖 Treatments", "👨‍⚕️ Staff", "💰 Value"],
    gym: ["🏋️ Equipment", "👨‍🏫 Trainers", "🧹 Cleanliness", "💰 Prices", "🎯 Classes", "💪 Atmosphere", "⏰ Hours"],
    fitness: ["👨‍🏫 Trainers", "🏋️ Equipment", "🎯 Classes", "💪 Atmosphere", "🧹 Cleanliness", "📈 Results", "👥 Community"],
    medical: ["👨‍⚕️ Staff", "🏥 Professionalism", "⏰ Wait Time", "🧹 Cleanliness", "💬 Communication", "❤️ Care"],
    dental: ["👨‍⚕️ Staff", "🏥 Professionalism", "😌 Comfort", "🧹 Cleanliness", "💬 Communication", "✨ Pain-Free"],
    retail: ["🛍️ Selection", "💰 Prices", "👨‍💼 Staff", "⭐ Quality", "🏪 Store Layout", "↩️ Returns"],
    auto: ["🤝 Honesty", "⚡ Speed", "💰 Prices", "⭐ Quality", "💬 Communication", "🏥 Professionalism"],
    hotel: ["🛏️ Room", "🧹 Cleanliness", "👨‍💼 Staff", "📍 Location", "🏊 Amenities", "💰 Value"],
    service: ["⭐ Quality", "🏥 Professionalism", "💬 Communication", "⏰ Timeliness", "💰 Value", "🧠 Expertise"],
    smoke: ["🌿 Products", "👨‍💼 Service", "⭐ Quality", "💰 Prices", "🏪 Selection", "✨ Atmosphere"],
    other: ["⭐ Quality", "👨‍💼 Service", "💰 Value", "✨ Ambiance", "👥 Staff", "🎯 Experience"],
};

export function getDefaultTagsForCategory(category: string): string[] {
    const key = category.toLowerCase().trim();
    return CATEGORY_TAGS[key] ?? CATEGORY_TAGS.other;
}
