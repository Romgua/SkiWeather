import { notFound } from "next/navigation";
import Link from "next/link";
import { stations } from "@/lib/stations";
import { getScoredStationBySlug } from "@/lib/data-service";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreBreakdownView } from "@/components/ScoreBreakdown";
import { DailyForecastView } from "@/components/DailyForecast";
import { TagBadge } from "@/components/TagBadge";
import { SnowChart } from "@/components/SnowChart";
import { getScoreLabel } from "@/lib/scoring";
import type { Metadata } from "next";

export const revalidate = 10800;

export function generateStaticParams() {
    return stations.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const station = stations.find((s) => s.slug === slug);
    if (!station) return {};

    return {
        title: `${station.name} — Conditions ski & météo | SkiWeather`,
        description: `Prévisions ski ${station.name} (${station.massif}) : enneigement, neige fraîche, météo 7 jours et scoring intelligent. ${station.altitudeMin}–${station.altitudeMax}m.`,
        openGraph: {
            title: `${station.name} — Conditions ski`,
            description: `Météo ski et enneigement ${station.name}, ${station.massif}`,
        },
    };
}

export default async function StationPage({
                                              params,
                                          }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const scored = await getScoredStationBySlug(slug);
    if (!scored) notFound();

    const { station, weather, score, dailyScores, tags } = scored;
    const daily = weather.daily;

    const snow3j = daily.slice(0, 3).reduce((s, d) => s + d.snowfallCm, 0);
    const snow7j = daily.reduce((s, d) => s + d.snowfallCm, 0);
    const windMax = Math.max(...daily.slice(0, 3).map((d) => d.windSpeedMaxKmh));
    const avgTemp =
        daily
            .slice(0, 3)
            .reduce((s, d) => s + (d.temperatureMaxC + d.temperatureMinC) / 2, 0) /
        3;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-snow-300/50">
                <Link href="/" className="hover:text-glacier-400 transition-colors">
                    Classement
                </Link>
                <span>/</span>
                <span className="text-snow-300">{station.name}</span>
            </nav>

            {/* Header */}
            <section className="mb-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                    <div className="shrink-0">
                        <ScoreBadge score={score.total} size="lg" showLabel />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-snow-50 mb-1">
                            {station.name}
                        </h1>
                        <p className="text-snow-300/60 mb-3">
                            {station.massif} · {station.region} ·{" "}
                            {station.altitudeMin}–{station.altitudeMax}m ·{" "}
                            {station.kmPistes}km de pistes
                        </p>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {tags.map((tag) => (
                                    <TagBadge key={tag.id} tag={tag} size="md" />
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="glass-card p-3 text-center">
                                <p className="text-2xl font-bold font-mono text-glacier-400">
                                    {Math.round(snow3j)}
                                    <span className="text-sm text-snow-300/50">cm</span>
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-snow-300/40 mt-1">
                                    Neige 3j
                                </p>
                            </div>
                            <div className="glass-card p-3 text-center">
                                <p className="text-2xl font-bold font-mono text-sky-400">
                                    {Math.round(snow7j)}
                                    <span className="text-sm text-snow-300/50">cm</span>
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-snow-300/40 mt-1">
                                    Neige 7j
                                </p>
                            </div>
                            <div className="glass-card p-3 text-center">
                                <p
                                    className={`text-2xl font-bold font-mono ${
                                        windMax > 60
                                            ? "text-red-400"
                                            : windMax > 40
                                                ? "text-amber-400"
                                                : "text-emerald-400"
                                    }`}
                                >
                                    {Math.round(windMax)}
                                    <span className="text-sm text-snow-300/50">km/h</span>
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-snow-300/40 mt-1">
                                    Vent max 3j
                                </p>
                            </div>
                            <div className="glass-card p-3 text-center">
                                <p
                                    className={`text-2xl font-bold font-mono ${
                                        avgTemp < -5
                                            ? "text-indigo-400"
                                            : avgTemp < 0
                                                ? "text-sky-400"
                                                : "text-orange-400"
                                    }`}
                                >
                                    {avgTemp > 0 ? "+" : ""}
                                    {Math.round(avgTemp)}
                                    <span className="text-sm text-snow-300/50">°C</span>
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-snow-300/40 mt-1">
                                    Temp moy. 3j
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Snow chart */}
            <section className="mb-8 glass-card p-5 animate-slide-up">
                <h3 className="text-sm font-semibold text-snow-200 uppercase tracking-wider mb-3">
                    Cumul neige prévu — 7 jours
                </h3>
                <SnowChart daily={daily} width={700} height={80} />
                <div className="flex justify-between mt-2 text-[10px] text-snow-300/40">
                    {daily.slice(0, 7).map((d) => {
                        const dt = new Date(d.date + "T12:00:00");
                        const days = ["D", "L", "M", "M", "J", "V", "S"];
                        return <span key={d.date}>{days[dt.getDay()]}</span>;
                    })}
                </div>
            </section>

            {/* 2-column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                <div className="lg:col-span-2 glass-card p-5">
                    <DailyForecastView daily={daily} dailyScores={dailyScores} />
                </div>

                <div className="glass-card p-5">
                    <ScoreBreakdownView breakdown={score} />

                    <div className="mt-6 p-4 rounded-xl bg-white/5">
                        <p className="text-sm font-semibold text-snow-200 mb-1">
                            Verdict
                        </p>
                        <p className="text-sm text-snow-300/70">
                            {score.total >= 75 && (
                                <>
                                    Conditions excellentes à {station.name} ! La station
                                    offre un score de{" "}
                                    <span className="font-semibold text-emerald-400">
                    {score.total}/100
                  </span>{" "}
                                    — foncez !
                                </>
                            )}
                            {score.total >= 50 && score.total < 75 && (
                                <>
                                    Bonnes conditions à {station.name} avec un score de{" "}
                                    <span className="font-semibold text-sky-400">
                    {score.total}/100
                  </span>
                                    .{" "}
                                    {snow3j > 10
                                        ? "De la neige fraîche est attendue !"
                                        : "Conditions correctes pour une sortie."}
                                </>
                            )}
                            {score.total < 50 && (
                                <>
                                    Conditions mitigées à {station.name} (
                                    <span className="font-semibold text-amber-400">
                    {score.total}/100
                  </span>
                                    ).{" "}
                                    {windMax > 50
                                        ? "Attention au vent fort."
                                        : "D'autres stations offrent de meilleures conditions cette semaine."}
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Back */}
            <div className="mt-8 text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium bg-glacier-500/10 text-glacier-400 hover:bg-glacier-500/20 transition-all ring-1 ring-glacier-500/20"
                >
                    ← Retour au classement
                </Link>
            </div>
        </div>
    );
}
