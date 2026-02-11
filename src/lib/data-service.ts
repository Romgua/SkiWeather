import { STATIONS } from "./stations";
import { fetchAllStationsWeather } from "./weather";
import { scoreStation } from "./scoring";
import { cacheGet, cacheSet } from "./cache";
import type { ScoredStation, StationWeather } from "./types";

// ============================================================
// Service de données principal
// Orchestre : fetch → scoring → tri → cache
// ============================================================

const CACHE_KEY = "scored-stations";
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3h

export async function getScoredStations(): Promise<ScoredStation[]> {
    // Vérifier le cache
    const cached = cacheGet<ScoredStation[]>(CACHE_KEY);
    if (cached) {
        console.log(`[SkiWeather] Cache hit — ${cached.length} stations`);
        return cached;
    }

    console.log(
        `[SkiWeather] Cache miss — fetching ${STATIONS.length} stations...`
    );
    const startTime = Date.now();

    // Fetch toutes les stations depuis Open-Meteo
    const weatherMap: Map<string, StationWeather> =
        await fetchAllStationsWeather(STATIONS);

    console.log(
        `[SkiWeather] Fetched ${weatherMap.size}/${STATIONS.length} stations in ${Date.now() - startTime}ms`
    );

    // Scorer chaque station
    const scored: ScoredStation[] = [];

    for (const station of STATIONS) {
        const weather = weatherMap.get(station.id);
        if (!weather) {
            console.warn(`[SkiWeather] No weather data for ${station.name}, skipping`);
            continue;
        }

        try {
            const result = scoreStation(station, weather);
            scored.push(result);
        } catch (e) {
            console.error(`[SkiWeather] Scoring failed for ${station.name}:`, e);
        }
    }

    // Trier par score décroissant
    scored.sort((a, b) => b.score.total - a.score.total);

    // Mettre en cache
    cacheSet(CACHE_KEY, scored, CACHE_TTL);

    console.log(
        `[SkiWeather] Scored & cached ${scored.length} stations. Top: ${scored[0]?.station.name} (${scored[0]?.score.total})`
    );

    return scored;
}

export async function getScoredStationBySlug(
    slug: string
): Promise<ScoredStation | null> {
    const all = await getScoredStations();
    return all.find((s) => s.station.slug === slug) ?? null;
}
