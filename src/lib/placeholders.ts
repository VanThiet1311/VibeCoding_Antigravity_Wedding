/**
 * Semantic Placeholders
 * Utility function to automatically generate placeholder images 
 * based on the context required (couple, floral, backgrounds, avatars).
 * Guarantees no blank empty spaces in the UI architecture.
 */

const BASE_URL = "https://images.unsplash.com";

const URLS = {
    couple: `${BASE_URL}/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop`,
    floral: `${BASE_URL}/photo-1507711200371-33230a10aa49?q=80&w=800&auto=format&fit=crop`,
    weddingBackground: `${BASE_URL}/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop`,
    avatarPortrait: `${BASE_URL}/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop`,
    avatarMale: `${BASE_URL}/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop`,
};

type PlaceholderType = keyof typeof URLS;

export function getPlaceholderImage(type: PlaceholderType): string {
    return URLS[type] || URLS.floral;
}
