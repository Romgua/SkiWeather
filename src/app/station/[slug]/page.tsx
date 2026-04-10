import { notFound } from "next/navigation";
import Link from "next/link";
import { stations } from "@/lib/stations";
import { getScoredStationBySlug } from "@/lib/data-service";
import { ScoreBadge } from "@/components/ScoreBadge";
import { TagBadge } from "@/components/TagBadge";
import { StationInteractive } from "@/components/StationInteractive";
import { getWeatherDescription } from "@/lib/weather-codes";
import type { Metadata } from "next";
import type { SkiinfoData, SnowForecastData } from "@/lib/types";

export const revalidate = 86400;

export function generateStaticParams() {
    return stations.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const station = stations.find((s) => s.slug === slug);
    if (!station) return {};
    return {
        title: `${station.name} — Conditions ski & météo | SkiWeather`,
        description: `Prévisions ski ${station.name} (${station.massif}) : enneigement, neige fraîche, météo 7 jours. ${station.altitudeMin}–${station.altitudeMax}m.`,
    };
}

// ─── Enneigement par altitude ──────────────────────────────────────────────────
function SnowDepthCard({ skiinfo, snowForecast, altMin, altMax }: {
    skiinfo: SkiinfoData | null;
    snowForecast: SnowForecastData | null;
    altMin: number;
    altMax: number;
}) {
    const top = skiinfo?.snowTop ?? snowForecast?.snowDepthHighCm ?? 0;
    const mid = skiinfo?.snowMid ?? 0;
    const base = skiinfo?.snowBase ?? snowForecast?.snowDepthLowCm ?? 0;
    const quality = skiinfo?.snowQuality ?? null;

    if (top === 0 && base === 0) return (
        <div className="rounded-3xl bg-sky-50 border border-sky-100 p-5">
            <h3 className="text-sm font-semibold text-sky-800 uppercase tracking-wider mb-3">❄️ Enneigement</h3>
            <p className="text-sm text-slate-500">Données en cours de récupération</p>
        </div>
    );

    const levels = [
        { label: `Sommet (${altMax}m)`, cm: top },
        ...(mid > 0 ? [{ label: "Milieu", cm: mid }] : []),
        { label: `Station (${altMin}m)`, cm: base },
    ];
    const maxCm = Math.max(...levels.map(l => l.cm), 1);

    return (
        <div className="rounded-3xl bg-sky-50 border border-sky-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-sky-800 uppercase tracking-wider">❄️ Enneigement</h3>
                {quality && <span className="rounded-full bg-sky-200 text-sky-800 text-xs font-bold px-3 py-1">{quality}</span>}
            </div>
            <div className="space-y-3">
                {levels.map(({ label, cm }) => (
                    <div key={label}>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-slate-600 font-medium">{label}</span>
                            <span className="font-bold font-mono text-sky-700">{cm} cm</span>
                        </div>
                        <div className="h-3 bg-sky-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.min(100, (cm / maxCm) * 100)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Remontées & pistes ────────────────────────────────────────────────────────
function LiftsCard({ skiinfo }: { skiinfo: SkiinfoData | null }) {
    if (!skiinfo || skiinfo.liftsTotal === 0) return (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5">
            <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-3">🚡 Remontées & pistes</h3>
            <p className="text-sm text-slate-500">Données en cours de récupération</p>
        </div>
    );

    const liftPct = Math.round((skiinfo.liftsOpen / skiinfo.liftsTotal) * 100);
    const runPct = skiinfo.runsTotal > 0 ? Math.round((skiinfo.runsOpen / skiinfo.runsTotal) * 100) : 0;

    return (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">🚡 Remontées & pistes</h3>
                <span className={`rounded-full text-xs font-bold px-3 py-1 ${skiinfo.isOpen ? "bg-emerald-200 text-emerald-800" : "bg-red-100 text-red-700"}`}>
                    {skiinfo.isOpen ? "Ouvert" : "Fermé"}
                </span>
            </div>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-600 font-medium">Remontées mécaniques</span>
                        <span className="font-bold text-emerald-700">{skiinfo.liftsOpen} / {skiinfo.liftsTotal}</span>
                    </div>
                    <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${liftPct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 text-right mt-0.5">{liftPct}% ouvertes</p>
                </div>
                {skiinfo.runsTotal > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-slate-600 font-medium">Pistes</span>
                            <span className="font-bold text-emerald-700">{skiinfo.runsOpen} / {skiinfo.runsTotal}</span>
                        </div>
                        <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${runPct}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 text-right mt-0.5">{runPct}% ouvertes</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Neige récente ─────────────────────────────────────────────────────────────
function RecentSnowCard({ skiinfo }: { skiinfo: SkiinfoData | null }) {
    const BAR_MAX = 50;
    if (!skiinfo || skiinfo.recentSnowTotal === 0) return null;

    const data = skiinfo.recentSnowDays;
    const maxVal = Math.max(...data, 1);

    return (
        <div className="rounded-3xl bg-indigo-50 border border-indigo-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider">🌨️ Neige récente</h3>
                <span className="text-sm font-bold text-indigo-700">{skiinfo.recentSnowTotal} cm <span className="text-xs font-normal text-slate-400">/ 72h</span></span>
            </div>
            <div className="flex gap-1.5 items-end" style={{ height: "56px" }}>
                {data.map((cm, i) => {
                    const h = cm > 0 ? Math.max(4, Math.round((cm / maxVal) * BAR_MAX)) : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                            {cm > 0 && <span className="text-[9px] font-bold text-indigo-600">{cm}</span>}
                            <div className={`w-full rounded-t ${cm > 0 ? "bg-indigo-400" : "bg-indigo-100"}`} style={{ height: cm > 0 ? `${h}px` : "3px" }} />
                        </div>
                    );
                })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">{data.length === 3 ? "Neige des 24h, 48h et 72h" : `${data.length} dernières périodes`}</p>
        </div>
    );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default async function StationPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ day?: string }> }) {
    const [{ slug }, sp] = await Promise.all([params, searchParams]);
    const initialDay = Math.max(0, parseInt(sp.day ?? "0", 10) || 0);
    const scored = await getScoredStationBySlug(slug);
    if (!scored) notFound();

    const { station, weather, score, dailyScores, tags, skiinfo, snowForecast } = scored;
    const daily = weather.daily;

    const snow3j = daily.slice(0, 3).reduce((s, d) => s + d.snowfallCm, 0);
    const snow7j = daily.reduce((s, d) => s + d.snowfallCm, 0);
    const windMax = Math.max(...daily.slice(0, 3).map(d => d.windSpeedMaxKmh));
    const avgTemp = daily.slice(0, 3).reduce((s, d) => s + (d.temperatureMaxC + d.temperatureMinC) / 2, 0) / 3;

    // Hero gradient selon météo
    const todayDesc = getWeatherDescription(daily[0]?.weatherCode ?? 0);
    const heroBg = todayDesc.category === "clear"
        ? "from-amber-300 via-sky-400 to-blue-600"
        : todayDesc.category === "snow"
            ? "from-blue-300 via-sky-400 to-indigo-600"
            : todayDesc.category === "rain"
                ? "from-sky-400 via-blue-500 to-indigo-600"
                : "from-sky-300 via-blue-400 to-blue-700";

    return (
        <div>
            {/* Hero */}
            <div className={`bg-gradient-to-br ${heroBg} text-white`}>
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <nav className="mb-4 flex items-center gap-2 text-sm text-white/60">
                        <Link href="/" className="hover:text-white transition-colors">Classement</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{station.name}</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        <div className="shrink-0 bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-sm">
                            <ScoreBadge score={dailyScores[initialDay]?.score ?? score.total} size="lg" showLabel onDark />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">{station.name}</h1>
                            <p className="text-white/70 text-sm mb-4">
                                {station.massif} · {station.region} · {station.altitudeMin}–{station.altitudeMax}m · {station.kmPistes}km
                            </p>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {tags.map(tag => <TagBadge key={tag.id} tag={tag} size="md" />)}
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { icon: "❄️", value: `${Math.round(snow3j)} cm`, label: "Neige 3j" },
                                    { icon: "🌨️", value: `${Math.round(snow7j)} cm`, label: "Neige 7j" },
                                    { icon: "💨", value: `${Math.round(windMax)} km/h`, label: "Vent max" },
                                    { icon: "🌡️", value: `${avgTemp > 0 ? "+" : ""}${Math.round(avgTemp)}°C`, label: "Temp. moy." },
                                ].map(({ icon, value, label }) => (
                                    <div key={label} className="rounded-2xl bg-white/20 backdrop-blur-sm p-3 text-center">
                                        <p className="text-lg">{icon}</p>
                                        <p className="text-lg font-bold font-mono mt-1">{value}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-white/65 mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                {/* Données skiinfo : enneigement + remontées + neige récente */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Conditions actuelles</h2>
                        <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5">Ne change pas avec la date — données en temps réel</span>
                    </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SnowDepthCard skiinfo={skiinfo} snowForecast={snowForecast} altMin={station.altitudeMin} altMax={station.altitudeMax} />
                    <LiftsCard skiinfo={skiinfo} />
                    <RecentSnowCard skiinfo={skiinfo} />
                </div>
                </div>

                {/* Prévisions interactives + score mis à jour */}
                <StationInteractive daily={daily} dailyScores={dailyScores} overallScore={score} initialDay={initialDay} />

                <div className="text-center pt-2">
                    <Link href="/" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
                        ← Retour au classement
                    </Link>
                </div>
            </div>
        </div>
    );
}
