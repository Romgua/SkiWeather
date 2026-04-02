import axios from "axios";
import * as cheerio from "cheerio";
import type { SnowForecastData } from "../types";
import {stations} from "../stations";

const BASE_URL = "https://www.snow-forecast.com/resorts";
const RATE_LIMIT_MS = 1200;

// Cache mémoire — TTL 3h
const cache = new Map<string, { data: SnowForecastData; ts: number }>();
const CACHE_TTL = 3 * 60 * 60 * 1000;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseNumber(text: string): number {
    const cleaned = text.replace(/[^\d.]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

async function scrapeStation(sfSlug: string): Promise<SnowForecastData | null> {
    try {
        const url = `${BASE_URL}/${sfSlug}/6day/mid`;
        console.log(`[Snow-Forecast] Scraping ${url}`);

        const { data: html } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
            },
        });

        const $ = cheerio.load(html);

        // Enneigement — encart latéral "Snow Report"
        let snowDepthHighCm = 0;
        let snowDepthLowCm = 0;
        let freshSnow3dCm = 0;
        let freshSnow7dCm = 0;

        // Chercher dans le bloc snow-depths
        $(".snow-depths__table tr, .snow-depths-table tr").each((_, row) => {
            const label = $(row).find("td:first-child, th:first-child").text().trim().toLowerCase();
            const value = $(row).find("td:last-child").text().trim();

            if (label.includes("top")) {
                snowDepthHighCm = parseNumber(value);
            } else if (label.includes("bottom") || label.includes("bas")) {
                snowDepthLowCm = parseNumber(value);
            }
        });

        // Fallback : chercher dans le format alternatif
        if (snowDepthHighCm === 0 && snowDepthLowCm === 0) {
            $(".snow-depths span, .snow-report__depth").each((_, el) => {
                const text = $(el).text().trim();
                const parent = $(el).parent().text().toLowerCase();
                const cm = parseNumber(text);
                if (cm > 0) {
                    if (parent.includes("top") || parent.includes("upper")) {
                        snowDepthHighCm = cm;
                    } else if (parent.includes("bottom") || parent.includes("lower") || parent.includes("base")) {
                        snowDepthLowCm = cm;
                    }
                }
            });
        }

        // Neige fraîche — chercher les cumuls
        $(".snow-report__newsnow, .forecast-table__container .snowfall").each((_, el) => {
            const text = $(el).text().trim();
            const parent = $(el).parent().text().toLowerCase();
            const cm = parseNumber(text);
            if (parent.includes("3") || parent.includes("three")) {
                freshSnow3dCm = cm;
            } else if (parent.includes("7") || parent.includes("seven") || parent.includes("week")) {
                freshSnow7dCm = cm;
            }
        });

        // Fallback cumuls depuis le tableau de prévisions
        if (freshSnow3dCm === 0) {
            const snowCells: number[] = [];
            $(".forecast-table__row--snow .forecast-table__cell, .snow-amount").each((_, el) => {
                const cm = parseNumber($(el).text().trim());
                snowCells.push(cm);
            });
            // Les 6 premières cellules = 3 jours (matin/soir)
            freshSnow3dCm = snowCells.slice(0, 6).reduce((s, x) => s + x, 0);
            freshSnow7dCm = snowCells.reduce((s, x) => s + x, 0);
        }

        // Convertir pouces en cm si nécessaire (Snow-Forecast peut être en inches)
        // On détecte si la page est en inches par la présence de "in" au lieu de "cm"
        const pageText = $("body").text();
        const isInches = pageText.includes('" of snow') || (pageText.match(/\d+\s*in\b/g)?.length ?? 0) > 3;
        if (isInches) {
            snowDepthHighCm = Math.round(snowDepthHighCm * 2.54);
            snowDepthLowCm = Math.round(snowDepthLowCm * 2.54);
            freshSnow3dCm = Math.round(freshSnow3dCm * 2.54);
            freshSnow7dCm = Math.round(freshSnow7dCm * 2.54);
        }

        console.log(
            `[Snow-Forecast] ${sfSlug}: high=${snowDepthHighCm}cm low=${snowDepthLowCm}cm fresh3d=${freshSnow3dCm}cm fresh7d=${freshSnow7dCm}cm`
        );

        return {
            snowDepthHighCm,
            snowDepthLowCm,
            freshSnow3dCm,
            freshSnow7dCm,
            scrapedAt: new Date().toISOString(),
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[Snow-Forecast] Failed ${sfSlug}: ${msg}`);
        return null;
    }
}

// ============================================================
// API publique
// ============================================================

export async function getSnowForecastData(
    stationId: string
): Promise<SnowForecastData | null> {
    const station = stations.find((s) => s.id === stationId);
    if (!station?.snowForecastSlug) return null;

    // Cache check
    const cached = cache.get(stationId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
    }

    const data = await scrapeStation(station.snowForecastSlug);
    if (data) {
        cache.set(stationId, { data, ts: Date.now() });
    }
    return data;
}

export async function getAllSnowForecastData(): Promise<
    Map<string, SnowForecastData>
> {
    const result = new Map<string, SnowForecastData>();
    const stationsWithSlug = stations.filter((s) => s.snowForecastSlug);

    console.log(
        `[Snow-Forecast] Scraping ${stationsWithSlug.length} stations...`
    );

    for (const station of stationsWithSlug) {
        // Pas de page snow-forecast pour cette station
        if (!station.snowForecastSlug) {
            continue;
        }
        
        // Cache check
        const cached = cache.get(station.id);
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            result.set(station.id, cached.data);
            continue;
        }

        const data = await scrapeStation(station.snowForecastSlug!);
        if (data) {
            cache.set(station.id, { data, ts: Date.now() });
            result.set(station.id, data);
        }

        await sleep(RATE_LIMIT_MS);
    }

    console.log(`[Snow-Forecast] Done. Got data for ${result.size} stations.`);
    return result;
}
