import axios from "axios";
import * as cheerio from "cheerio";
import { getSkiinfoUrl } from "../skiinfo-mapping";
import {SkiinfoData} from "@/lib/types";

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    Accept: "text/html",
    "Accept-Language": "fr-FR,fr;q=0.9",
};

function parseNum(s: string): number {
    const m = s.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
}

function parseFraction(s: string): [number, number] {
    const m = s.match(/(\d+)\s*\/\s*(\d+)/);
    return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : [0, 0];
}

export async function scrapeSkiinfo(
    stationId: string
): Promise<SkiinfoData | null> {
    const url = getSkiinfoUrl(stationId);
    if (!url) {
        console.warn(`[skiinfo] Pas de mapping pour ${stationId}`);
        return null;
    }

    try {
        console.log(`[skiinfo] Fetching ${url}`);
        const { data: html } = await axios.get<string>(url, {
            timeout: 12000,
            headers: HEADERS,
        });
        const $ = cheerio.load(html);

        const nextDataJson = tryParseNextData($, stationId);
        if (nextDataJson) return nextDataJson;

        return parseHtml($, stationId);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown";
        console.error(`[skiinfo] ❌ ${stationId}: ${msg}`);
        return null;
    }
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
        const resort = pageProps?.resort as Record<string, unknown> | undefined;
        if (!resort) return null;

        const ski = (resort.skiReport || resort.skireport || {}) as Record<
            string,
            unknown
        >;
        const snow = (ski.snowConditions || ski.snow || {}) as Record<
            string,
            unknown
        >;
        const lifts = (ski.lifts || {}) as Record<string, unknown>;
        const runs = (ski.runs || ski.trails || {}) as Record<string, unknown>;

        const baseObj = (snow.base || {}) as Record<string, unknown>;
        const midObj = (snow.mid || {}) as Record<string, unknown>;
        const topObj = (snow.top || {}) as Record<string, unknown>;

        const snowBase = Number(baseObj.depth ?? snow.bottomDepth ?? 0);
        const snowMid = Number(midObj.depth ?? snow.middleDepth ?? 0);
        const snowTop = Number(topObj.depth ?? snow.topDepth ?? 0);
        const snowQuality = String(
            baseObj.condition || snow.condition || snow.quality || ""
        );

        const recentSnowDays = extractSnowArray(
            ski.recentSnowfall || ski.pastSnowfall || []
        );
        const forecastSnowDays = extractSnowArray(
            ski.forecastSnowfall || ski.futureSnowfall || []
        );

        const liftsOpen = Number(lifts.open ?? lifts.openCount ?? 0);
        const liftsTotal = Number(lifts.total ?? lifts.totalCount ?? 0);
        const runsOpen = Number(runs.open ?? runs.openCount ?? 0);
        const runsTotal = Number(runs.total ?? runs.totalCount ?? 0);

        const isOpen =
            ski.status === "open" || ski.isOpen === true || liftsOpen > 0;

        const result: SkiinfoData = {
            stationId,
            snowBase,
            snowMid,
            snowTop,
            snowQuality,
            recentSnowDays,
            recentSnowTotal: recentSnowDays.reduce((a, b) => a + b, 0),
            forecastSnowDays,
            forecastSnowTotal: forecastSnowDays.reduce((a, b) => a + b, 0),
            liftsOpen,
            liftsTotal,
            runsOpen,
            runsTotal,
            isOpen,
            scrapedAt: new Date().toISOString(),
        };

        console.log(
            `[skiinfo] ✅ ${stationId} (JSON): base=${snowBase}cm mid=${snowMid}cm top=${snowTop}cm lifts=${liftsOpen}/${liftsTotal} runs=${runsOpen}/${runsTotal}`
        );
        return result;
    } catch {
        return null;
    }
}

function extractSnowArray(data: unknown): number[] {
    if (Array.isArray(data)) {
        return data.map((item: unknown) => {
            if (typeof item === "number") return item;
            if (typeof item === "object" && item !== null) {
                const obj = item as Record<string, unknown>;
                return Number(obj.value ?? obj.snow ?? obj.cm ?? obj.amount ?? 0);
            }
            return parseNum(String(item));
        });
    }
    return [];
}

function parseHtml(
    $: ReturnType<typeof cheerio.load>,
    stationId: string
): SkiinfoData {
    let snowBase = 0;
    let snowMid = 0;
    let snowTop = 0;
    let snowQuality = "";

    $('[class*="styles_box__I34B8"], [class*="box__I34B8"]').each(
        (_i: number, el: cheerio.Element) => {
            const text = $(el).text().replace(/\s+/g, " ").trim();
            const cmMatch = text.match(/(\d+)\s*cm/);
            const cm = cmMatch ? parseInt(cmMatch[1], 10) : 0;

            const qualityMatch = text.match(
                /cm\s*(Poudreuse|Damée|Dure|Gelée|Humide|Croûtée|Artificielle|Printemps|Lourde|Fraîche)/i
            );

            if (/en\s*bas/i.test(text)) {
                snowBase = cm;
                if (qualityMatch && !snowQuality) snowQuality = qualityMatch[1];
            } else if (/moyenne/i.test(text)) {
                snowMid = cm;
            } else if (/en\s*haut/i.test(text)) {
                snowTop = cm;
                if (qualityMatch && !snowQuality) snowQuality = qualityMatch[1];
            }
        }
    );

    const snowTables = $(
        'table[class*="styles_snowChart"], table[class*="snowChart"]'
    );

    const recentSnowDays = parseSnowTable($, snowTables.eq(0));
    const forecastSnowDays = parseSnowTable($, snowTables.eq(1));

    let liftsOpen = 0;
    let liftsTotal = 0;
    let runsOpen = 0;
    let runsTotal = 0;
    let fracIndex = 0;

    $('[class*="styles_box__cUvBW"], [class*="box__cUvBW"]').each(
        (_i: number, el: cheerio.Element) => {
            const text = $(el).text().replace(/\s+/g, " ").trim();
            const [open, total] = parseFraction(text);

            if (fracIndex === 0) {
                liftsOpen = open;
                liftsTotal = total;
            } else if (fracIndex === 1) {
                runsOpen = open;
                runsTotal = total;
            }
            fracIndex++;
        }
    );

    const isOpen = $('[class*="styles_open"]').length > 0 || liftsOpen > 0;

    const result: SkiinfoData = {
        stationId,
        snowBase,
        snowMid,
        snowTop,
        snowQuality,
        recentSnowDays,
        recentSnowTotal: recentSnowDays.reduce((a, b) => a + b, 0),
        forecastSnowDays,
        forecastSnowTotal: forecastSnowDays.reduce((a, b) => a + b, 0),
        liftsOpen,
        liftsTotal,
        runsOpen,
        runsTotal,
        isOpen,
        scrapedAt: new Date().toISOString(),
    };

    console.log(
        `[skiinfo] ✅ ${stationId} (HTML): base=${snowBase}cm mid=${snowMid}cm top=${snowTop}cm lifts=${liftsOpen}/${liftsTotal} runs=${runsOpen}/${runsTotal} recent=${result.recentSnowTotal}cm forecast=${result.forecastSnowTotal}cm`
    );
    return result;
}

function parseSnowTable(
    $: ReturnType<typeof cheerio.load>,
    $table: ReturnType<ReturnType<typeof cheerio.load>>
): number[] {
    const values: number[] = [];

    if (!$table.length) return values;

    $table
        .find('[class*="styles_cell"], [class*="cell__"]')
        .each((_i: number, cell: cheerio.Element) => {
            const text = $(cell).text().trim();
            if (/\d+\s*cm/i.test(text)) {
                values.push(parseNum(text));
            }
        });

    if (values.length === 0) {
        $table
            .find('[class*="styles_snow"], [class*="snow__"]')
            .each((_i: number, span: cheerio.Element) => {
                const text = $(span).text().trim();
                values.push(parseNum(text));
            });
    }

    return values;
}

export async function scrapeAllSkiinfo(
    stationIds: string[],
    delayMs: number = 800
): Promise<Map<string, SkiinfoData>> {
    const results = new Map<string, SkiinfoData>();

    for (const id of stationIds) {
        const data = await scrapeSkiinfo(id);
        if (data) {
            results.set(id, data);
        }
        await new Promise((r) => setTimeout(r, delayMs));
    }

    console.log(
        `[skiinfo] Scraping terminé: ${results.size}/${stationIds.length} stations`
    );
    return results;
}
