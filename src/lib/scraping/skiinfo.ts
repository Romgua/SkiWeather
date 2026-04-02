import axios from "axios";
import * as cheerio from "cheerio";
import { getSkiinfoUrl } from "../skiinfo-mapping";
import {SkiinfoData} from "@/lib/types";

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    Accept: "text/html",
    "Accept-Language": "fr-FR,fr;q=0.9",
};

function parseNum(s: string): number {
    const m = s.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

/** Extrait la qualité de neige depuis le HTML (class styles_metricCaption) */
function extractSnowQuality($: ReturnType<typeof cheerio.load>): string {
    let quality = "";
    $('[class*="metricCaption"]').each((_i, el) => {
        const text = $(el).text().trim();
        if (/poudreuse|damée|dure|fraîche|artificielle|humide|croûtée|printemps|lourde/i.test(text)) {
            quality = text;
            return false; // break
        }
    });
    return quality;
}

function tryParseNextData(
    $: ReturnType<typeof cheerio.load>,
    stationId: string
): SkiinfoData | null {
    try {
        const scriptContent = $("#__NEXT_DATA__").html();
        if (!scriptContent) return null;

        const json = JSON.parse(scriptContent) as Record<string, unknown>;
        const props = json?.props as Record<string, unknown> | undefined;
        const pageProps = props?.pageProps as Record<string, unknown> | undefined;
        if (!pageProps) return null;

        // Structure actuelle : pageProps.fullResort + pageProps.shortWeather
        const fullResort = pageProps.fullResort as Record<string, unknown> | undefined;
        const shortWeather = pageProps.shortWeather as Record<string, unknown> | undefined;
        if (!fullResort) return null;

        const snow = (fullResort.snow || {}) as Record<string, unknown>;
        const lifts = (fullResort.lifts || {}) as Record<string, unknown>;
        const runs = (fullResort.runs || {}) as Record<string, unknown>;
        const swSnow = (shortWeather?.snow || {}) as Record<string, unknown>;

        const snowBase  = Number(snow.base   ?? 0);
        const snowMid   = Number(snow.middle ?? 0);
        const snowTop   = Number(snow.summit ?? 0);

        const liftsOpen  = Number(lifts.open  ?? 0);
        const liftsTotal = Number(lifts.total ?? 0);
        const runsOpen   = Number(runs.open   ?? 0);
        const runsTotal  = Number(runs.total  ?? 0);
        const isOpen     = liftsOpen > 0;

        // Historique neige : last24/last48/last72 → tableau de 3 éléments
        const last24 = Number(snow.last24 ?? 0);
        const last48 = Number(snow.last48 ?? 0);
        const last72 = Number(swSnow.last72 ?? snow.last72 ?? 0);
        const recentSnowDays = [last24, last48 - last24, last72 - last48].map(v => Math.max(0, v));
        const recentSnowTotal = last72;

        // Prévisions neige
        const forecast72 = Number(swSnow.forecast72 ?? 0);
        const forecastSnowDays = forecast72 > 0 ? [forecast72] : [];
        const forecastSnowTotal = forecast72;

        // Qualité de neige depuis HTML
        const snowQuality = extractSnowQuality($);

        const result: SkiinfoData = {
            stationId,
            snowBase, snowMid, snowTop, snowQuality,
            recentSnowDays, recentSnowTotal,
            forecastSnowDays, forecastSnowTotal,
            liftsOpen, liftsTotal, runsOpen, runsTotal, isOpen,
            scrapedAt: new Date().toISOString(),
        };

        console.log(`[skiinfo] ✅ ${stationId} (JSON): base=${snowBase}cm mid=${snowMid}cm top=${snowTop}cm lifts=${liftsOpen}/${liftsTotal} runs=${runsOpen}/${runsTotal} quality="${snowQuality}"`);
        return result;
    } catch {
        return null;
    }
}

export async function scrapeSkiinfo(stationId: string): Promise<SkiinfoData | null> {
    const url = getSkiinfoUrl(stationId);
    if (!url) {
        console.warn(`[skiinfo] Pas de mapping pour ${stationId}`);
        return null;
    }

    try {
        console.log(`[skiinfo] Fetching ${url}`);
        const { data: html } = await axios.get<string>(url, { timeout: 12000, headers: HEADERS });
        const $ = cheerio.load(html);

        const result = tryParseNextData($, stationId);
        if (result) return result;

        console.warn(`[skiinfo] ⚠️ ${stationId}: JSON parse failed, skipping HTML fallback`);
        return null;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown";
        console.error(`[skiinfo] ❌ ${stationId}: ${msg}`);
        return null;
    }
}

export async function scrapeAllSkiinfo(
    stationIds: string[],
    delayMs: number = 800
): Promise<Map<string, SkiinfoData>> {
    const results = new Map<string, SkiinfoData>();

    for (const id of stationIds) {
        const data = await scrapeSkiinfo(id);
        if (data) results.set(id, data);
        await new Promise((r) => setTimeout(r, delayMs));
    }

    console.log(`[skiinfo] Scraping terminé: ${results.size}/${stationIds.length} stations`);
    return results;
}
