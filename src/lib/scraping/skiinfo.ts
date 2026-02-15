import axios from "axios";
import * as cheerio from "cheerio";
import type { SkiinfoData } from "../types";
import {stations} from "../stations";

const BASE_URL = "https://www.skiinfo.fr";
const RATE_LIMIT_MS = 1200;

const cache = new Map<string, { data: SkiinfoData; ts: number }>();
const CACHE_TTL = 3 * 60 * 60 * 1000;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseNumber(text: string): number {
    const cleaned = text.replace(/[^\d.]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function inferRegionPath(massif: string): string {
    const lower = massif.toLowerCase();
    if (
        lower.includes("mont-blanc") ||
        lower.includes("tarentaise") ||
        lower.includes("vanoise") ||
        lower.includes("beaufortain") ||
        lower.includes("aravis") ||
        lower.includes("chablais") ||
        lower.includes("giffre") ||
        lower.includes("chartreuse") ||
        lower.includes("belledonne") ||
        lower.includes("maurienne") ||
        lower.includes("grandes rousses")
    ) {
        return "alpes-du-nord";
    }
    if (
        lower.includes("oisans") ||
        lower.includes("serre chevalier") ||
        lower.includes("écrins") ||
        lower.includes("queyras") ||
        lower.includes("ubaye") ||
        lower.includes("mercantour") ||
        lower.includes("dévoluy") ||
        lower.includes("vercors")
    ) {
        return "alpes-du-sud";
    }
    if (lower.includes("pyrénées")) {
        return "pyrenees";
    }
    if (lower.includes("jura")) {
        return "jura";
    }
    if (lower.includes("vosges")) {
        return "vosges";
    }
    if (lower.includes("massif central")) {
        return "massif-central";
    }
    return "alpes-du-nord";
}

async function scrapeStation(
    skiinfoSlug: string,
    massif: string
): Promise<SkiinfoData | null> {
    try {
        const regionPath = inferRegionPath(massif);
        const url = `${BASE_URL}/${regionPath}/${skiinfoSlug}/bulletin-enneigement.html`;
        console.log(`[Skiinfo] Scraping ${url}`);

        const { data: html } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "fr-FR,fr;q=0.9",
            },
        });

        const $ = cheerio.load(html);

        let openLifts = 0;
        let totalLifts = 0;
        let openSlopes = 0;
        let totalSlopes = 0;
        let isOpen = false;

        // Format: "12/45 remontées ouvertes" ou "12 / 45"
        $(".resort-info__stat, .snow-report-data, .key-stat, .lift-status, [class*='lift'], [class*='piste']").each(
            (_, el) => {
                const text = $(el).text().trim().toLowerCase();

                // Remontées
                const liftMatch = text.match(/(\d+)\s*[/÷sur]\s*(\d+)\s*(?:remontée|lift|télésiège|téléphérique|installation)/i);
                if (liftMatch) {
                    openLifts = parseInt(liftMatch[1], 10);
                    totalLifts = parseInt(liftMatch[2], 10);
                }

                // Pistes en km
                const pisteKmMatch = text.match(/(\d+(?:[.,]\d+)?)\s*[/÷sur]\s*(\d+(?:[.,]\d+)?)\s*km/i);
                if (pisteKmMatch) {
                    openSlopes = parseFloat(pisteKmMatch[1].replace(",", "."));
                    totalSlopes = parseFloat(pisteKmMatch[2].replace(",", "."));
                }

                // Pistes en nombre
                if (openSlopes === 0) {
                    const pisteNumMatch = text.match(/(\d+)\s*[/÷sur]\s*(\d+)\s*piste/i);
                    if (pisteNumMatch) {
                        openSlopes = parseInt(pisteNumMatch[1], 10);
                        totalSlopes = parseInt(pisteNumMatch[2], 10);
                    }
                }
            }
        );

        // Fallback : chercher dans tout le body avec regex
        if (totalLifts === 0) {
            const bodyText = $("body").text();
            const liftFallback = bodyText.match(/(\d+)\s*[/]\s*(\d+)\s*(?:remontée|lift|installation)/i);
            if (liftFallback) {
                openLifts = parseInt(liftFallback[1], 10);
                totalLifts = parseInt(liftFallback[2], 10);
            }
        }

        // Statut ouverture
        const statusText = $("body").text().toLowerCase();
        isOpen =
            openLifts > 0 ||
            statusText.includes("ouvert") ||
            statusText.includes("open");

        // Ne pas considérer "fermé" comme ouvert
        if (
            statusText.includes("fermé") ||
            statusText.includes("saison terminée") ||
            statusText.includes("closed")
        ) {
            if (openLifts === 0) isOpen = false;
        }

        console.log(
            `[Skiinfo] ${skiinfoSlug}: lifts=${openLifts}/${totalLifts} slopes=${openSlopes}/${totalSlopes} open=${isOpen}`
        );

        return {
            openLifts,
            totalLifts,
            openSlopes,
            totalSlopes,
            isOpen,
            scrapedAt: new Date().toISOString(),
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[Skiinfo] Failed ${skiinfoSlug}: ${msg}`);
        return null;
    }
}

// ============================================================
// API publique
// ============================================================

export async function getSkiinfoData(
    stationId: string
): Promise<SkiinfoData | null> {
    const station = stations.find((s) => s.id === stationId);
    if (!station?.skiinfoSlug) return null;

    const cached = cache.get(stationId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
    }

    const data = await scrapeStation(station.skiinfoSlug, station.massif);
    if (data) {
        cache.set(stationId, { data, ts: Date.now() });
    }
    return data;
}

export async function getAllSkiinfoData(): Promise<Map<string, SkiinfoData>> {
    const result = new Map<string, SkiinfoData>();
    const stationsWithSlug = stations.filter((s) => s.skiinfoSlug);

    console.log(`[Skiinfo] Scraping ${stationsWithSlug.length} stations...`);

    for (const station of stationsWithSlug) {
        const cached = cache.get(station.id);
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            result.set(station.id, cached.data);
            continue;
        }

        const data = await scrapeStation(station.skiinfoSlug!, station.massif);
        if (data) {
            cache.set(station.id, { data, ts: Date.now() });
            result.set(station.id, data);
        }

        await sleep(RATE_LIMIT_MS);
    }

    console.log(`[Skiinfo] Done. Got data for ${result.size} stations.`);
    return result;
}
