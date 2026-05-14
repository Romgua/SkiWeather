export interface SkiinfoMapping {
    skiinfoRegion: string;
    skiinfoSlug: string;
}

/**
 * Mapping stationId → skiinfo region/slug
 * Vérifié le 2025-01-xx sur skiinfo.fr/bulletin-neige
 * null = pas de page skiinfo trouvée
 */
export const SKIINFO_MAP: Record<string, SkiinfoMapping | null> = {
    // ──── ALPES DU NORD ────
    "chamonix":           { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "chamonix" },
    "megeve":             { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "megeve" },
    "les-contamines":     { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "les-contamines-montjoie" },
    "val-thorens":        { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "val-thorens" },
    "courchevel":         { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "courchevel" },
    "meribel":            { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "meribel" },
    "la-plagne":          { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "la-plagne" },
    "les-arcs":           { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "les-arcs-bourg-st-maurice" },
    "tignes":             { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "tignes" },
    "val-disere":         { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "val-disere" },
    "sainte-foy":         { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "sainte-foy-tarentaise" },
    "la-rosiere":         { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "la-rosiere-1850" },
    "pralognan":          { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "pralognan-la-vanoise" },
    "hauteluce":          { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "les-saisies" },
    "la-clusaz":          { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "la-clusaz" },
    "le-grand-bornand":   { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "le-grand-bornand" },
    "avoriaz":            { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "avoriaz" },
    "morzine":            { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "morzine" },
    "chatel":             { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "chatel" },
    "flaine":             { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "flaine" },
    "samoens":            { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "samoens" },
    "chamrousse":         { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "chamrousse" },
    "alpe-dhuez":         { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "alpe-dhuez" },
    "les-deux-alpes":     { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "les-2-alpes" },
    "valmeinier":         { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "valmeinier" },
    "valloire":           { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "valloire" },
    "villard-de-lans":    { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "villard-de-lans" },
    "col-de-porte":       { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "col-de-porte" },
    "les-menuires":       { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "les-menuires" },
    "les-sybelles":       { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "les-sybelles-le-corbier" },
    "les-karellis":       { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "les-karellis" },
    "aussois":            { skiinfoRegion: "alpes-du-nord", skiinfoSlug: "aussois" },

    // ──── ALPES DU SUD ────
    "serre-chevalier":    { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "serre-chevalier" },
    "montgenevre":        { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "montgenevre" },
    "pelvoux-vallouise":  { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "pelvoux-vallouise" },
    "vars":               { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "vars" },
    "risoul":             { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "risoul" },
    "pra-loup":           { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "praloup" },
    "isola-2000":         { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "isola-2000" },
    "auron":              { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "auron" },
    "superdevoluy":       { skiinfoRegion: "alpes-du-sud", skiinfoSlug: "superdevoluy-la-joue-du-loup" },

    // ──── PYRÉNÉES ────
    "saint-lary":         { skiinfoRegion: "pyrenees", skiinfoSlug: "saint-lary-soulan" },
    "piau-engaly":        { skiinfoRegion: "pyrenees", skiinfoSlug: "piau-engaly" },
    "grand-tourmalet":    { skiinfoRegion: "pyrenees", skiinfoSlug: "la-mongie-bareges" },
    "cauterets":          { skiinfoRegion: "pyrenees", skiinfoSlug: "cauterets" },
    "luz-ardiden":        { skiinfoRegion: "pyrenees", skiinfoSlug: "luz-ardiden" },
    "luchon-superbagneres": { skiinfoRegion: "pyrenees", skiinfoSlug: "luchon-superbagneres" },
    "font-romeu":         { skiinfoRegion: "pyrenees", skiinfoSlug: "font-romeu-pyrenees-2000" },
    "les-angles":         { skiinfoRegion: "pyrenees", skiinfoSlug: "les-angles" },
    "ax-3-domaines":      { skiinfoRegion: "pyrenees", skiinfoSlug: "ax-3-domaines" },
    "gourette":           { skiinfoRegion: "pyrenees", skiinfoSlug: "gourette" },
    "la-pierre-saint-martin": { skiinfoRegion: "pyrenees", skiinfoSlug: "la-pierre-st-martin" },

    // ──── JURA ────
    "metabief":           { skiinfoRegion: "jura", skiinfoSlug: "metabief-mont-dor" },

    // ──── VOSGES ────
    "la-bresse":          { skiinfoRegion: "vosges", skiinfoSlug: "la-bresse-hohneck" },

    // ──── MASSIF CENTRAL ────
    "super-besse":        { skiinfoRegion: "massif-central", skiinfoSlug: "besse-super-besse" },
    "le-mont-dore":       { skiinfoRegion: "massif-central", skiinfoSlug: "le-mont-dore" },
    "le-lioran":          { skiinfoRegion: "massif-central", skiinfoSlug: "le-lioran" },
};

/**
 * Construit l'URL bulletin-neige skiinfo pour une station
 */
export function getSkiinfoUrl(stationId: string): string | null {
    const mapping = SKIINFO_MAP[stationId];
    if (!mapping) return null;
    return `https://www.skiinfo.fr/${mapping.skiinfoRegion}/${mapping.skiinfoSlug}/bulletin-neige`;
}
