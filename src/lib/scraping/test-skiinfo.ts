import axios from "axios";

const VARIANTS: Record<string, string[]> = {
    "sainte-foy": ["Sainte-Foy", "SainteFoy", "Sainte-Foy-Tarentaise"],
    "les-sybelles": ["Saint-sorlin-darves", "Le-Corbier", "La-Toussuire"],
    "font-romeu": ["FontRomeu", "Font-Romeu", "Font-Romeu-Pyrenees-2000"],
    "ax-3-domaines": ["Ax-les-Thermes", "Ax3Domaines", "Ax-3-Domaines"],
    "la-pierre-saint-martin": ["LaPierreSaintMartin", "La-Pierre-Saint-Martin", "La-Pierre-St-Martin"],
    "luz-ardiden": ["LuzArdiden", "Luz-Ardiden"],
    "la-bresse": ["La-Bresse", "LaBresse", "La-Bresse-Hohneck"],
    "les-karellis": ["Les-Karellis", "LesKarellis"],
    "les-contamines": ["Les-Contamines", "LesContamines", "Les-Contamines-Montjoie"],
    "les-menuires": ["Les-Menuires", "LesMenuires"],
    "aussois": ["Aussois"],
    "luchon-superbagneres": ["Superbagneres", "Luchon-Superbagneres", "LuchonSuperbagneres"],
};

async function checkSlug(slug: string): Promise<boolean> {
    try {
        const url = `https://www.snow-forecast.com/resorts/${slug}/6day/mid`;
        const res = await axios.head(url, { timeout: 5000 });
        return res.status === 200;
    } catch {
        return false;
    }
}

async function main() {
    for (const [stationId, variants] of Object.entries(VARIANTS)) {
        console.log(`\n--- ${stationId} ---`);
        for (const variant of variants) {
            // Rate limit
            await new Promise((r) => setTimeout(r, 1200));
            const ok = await checkSlug(variant);
            console.log(`  ${ok ? "✅" : "❌"} ${variant}`);
        }
    }
}

main();
