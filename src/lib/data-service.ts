import { stations } from "./stations";
import { fetchStationWeather } from "./weather";
import { scoreStation } from "./scoring";
import type { ScoredStation, SnowForecastData, SkiinfoData } from "./types";
import { getAllSnowForecastData, getSnowForecastData } from "./scraping/snow-forecast";
import { scrapeAllSkiinfo, scrapeSkiinfo } from "./scraping/skiinfo";

// ============================================================
// Cache mémoire simple
// ============================================================
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
let cachedStations: ScoredStation[] | null = null;
let cacheTimestamp = 0;

// ============================================================
// Toutes les stations scorées (home page)
// ============================================================
export async function getScoredStations(): Promise<ScoredStation[]> {
    // Vérifier cache
    if (cachedStations && Date.now() - cacheTimestamp < CACHE_TTL) {
        console.log(`[SkiWeather] Cache hit — ${cachedStations.length} stations`);
        return cachedStations;
    }

    console.log(`[SkiWeather] Fetching ${stations.length} stations...`);
    const startTime = Date.now();

    // Scraping en parallèle — silencieux si ça échoue
    const stationIds = stations.map((s) => s.id);

    const [snowForecastMap, skiinfoMap] = await Promise.all([
        getAllSnowForecastData().catch((err: Error) => {
            console.warn("[SkiWeather] Snow-Forecast scraping failed:", err.message);
            return new Map<string, SnowForecastData>();
        }),
        scrapeAllSkiinfo(stationIds).catch((err: Error) => {
            console.warn("[SkiWeather] Skiinfo scraping failed:", err.message);
            return new Map<string, SkiinfoData>();
        }),
    ]);

    // Fetch météo + scoring — par batch de 10 en parallèle
    const BATCH_SIZE = 10;
    const results: ScoredStation[] = [];

    for (let i = 0; i < stations.length; i += BATCH_SIZE) {
        const batch = stations.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.allSettled(
            batch.map(async (station) => {
                const weather = await fetchStationWeather(station);
                if (!weather) return null;

                const snowForecast = snowForecastMap.get(station.id) ?? null;
                const skiinfo = skiinfoMap.get(station.id) ?? null;

                return scoreStation(station, weather, snowForecast, skiinfo);
            })
        );

        for (const result of batchResults) {
            if (result.status === "fulfilled" && result.value) {
                results.push(result.value);
            }
        }
    }

    // Tri par score décroissant
    results.sort((a, b) => b.score.total - a.score.total);

    // Mise en cache
    cachedStations = results;
    cacheTimestamp = Date.now();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
        `[SkiWeather] ${results.length} stations scored in ${elapsed}s. Top: ${results[0]?.station.name} (${results[0]?.score.total})`
    );

    return results;
}

// ============================================================
// Une seule station par slug (page détail)
// ============================================================
export async function getScoredStationBySlug(
    slug: string
): Promise<ScoredStation | null> {
    // D'abord chercher dans le cache
    if (cachedStations && Date.now() - cacheTimestamp < CACHE_TTL) {
        const found = cachedStations.find((s) => s.station.slug === slug);
        if (found) return found;
    }

    // Sinon fetch individuel
    const station = stations.find((s) => s.slug === slug);
    if (!station) return null;

    try {
        const weather = await fetchStationWeather(station);
        if (!weather) return null;

        const [snowForecast, skiinfo] = await Promise.all([
            getSnowForecastData(station.id).catch(() => null),
            scrapeSkiinfo(station.id).catch(() => null),
        ]);

        return scoreStation(station, weather, snowForecast, skiinfo);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown";
        console.warn(`[SkiWeather] Error fetching ${station.name}: ${msg}`);
        return null;
    }
}
