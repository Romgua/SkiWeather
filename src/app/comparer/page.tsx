import { redirect } from "next/navigation";
import Link from "next/link";
import { getScoredStations } from "@/lib/data-service";
import { ScoreBadge } from "@/components/ScoreBadge";
import { TagBadge } from "@/components/TagBadge";
import { getWeatherDescription } from "@/lib/weather-codes";
import type { ScoredStation } from "@/lib/types";

export const revalidate = 10800;

interface ComparerPageProps {
    searchParams: Promise<{ s?: string }>;
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
    const pct = Math.round((value / max) * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 w-8 text-right">{value}</span>
        </div>
    );
}

function WeekForecast({ station }: { station: ScoredStation }) {
    return (
        <div className="grid grid-cols-7 gap-1">
            {station.weather.daily.slice(0, 7).map((day, i) => {
                const desc = getWeatherDescription(day.weatherCode);
                const ds = station.dailyScores[i];
                const scoreColor = (ds?.score ?? 0) >= 70 ? "text-emerald-600" : (ds?.score ?? 0) >= 40 ? "text-amber-600" : "text-red-500";
                return (
                    <div key={day.date} className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-50 p-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                            {i === 0 ? "Auj" : new Date(day.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short" })}
                        </span>
                        <span className="text-base" title={desc.label}>{desc.icon}</span>
                        <span className="text-[10px] font-mono text-slate-600">{Math.round(day.temperatureMaxC)}°</span>
                        {day.snowfallCm > 0 && (
                            <span className="text-[10px] font-bold text-blue-600">{Math.round(day.snowfallCm)}cm</span>
                        )}
                        <span className={`text-[10px] font-bold font-mono ${scoreColor}`}>{ds?.score ?? "–"}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default async function ComparerPage({ searchParams }: ComparerPageProps) {
    const params = await searchParams;
    const slugs = (params.s ?? "").split(",").filter(Boolean).slice(0, 3);

    if (slugs.length < 2) redirect("/");

    const allStations = await getScoredStations();
    const selected = slugs
        .map((slug) => allStations.find((s) => s.station.slug === slug))
        .filter((s): s is ScoredStation => !!s);

    if (selected.length < 2) redirect("/");

    const rows = [
        { label: "Score global", key: "total" as const },
        { label: "Neige fraîche", key: "snow" as const },
        { label: "Enneigement", key: "snowpack" as const },
        { label: "Météo", key: "weather" as const },
        { label: "Vent", key: "wind" as const },
        { label: "Ouverture", key: "opening" as const },
    ];

    const scoreColors: Record<string, string> = {
        total: "bg-blue-500",
        snow: "bg-sky-400",
        snowpack: "bg-indigo-400",
        weather: "bg-amber-400",
        wind: "bg-emerald-400",
        opening: "bg-teal-400",
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    ← Retour au classement
                </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                Comparaison de stations
            </h1>
            <p className="text-slate-500 text-sm mb-8">
                Comparez les conditions actuelles côte à côte
            </p>

            {/* Colonnes stations */}
            <div className={`grid gap-4 ${selected.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {selected.map((s) => (
                    <div key={s.station.id} className="card p-5 space-y-4">
                        {/* En-tête */}
                        <div className="text-center space-y-2">
                            <ScoreBadge score={s.score.total} size="lg" showLabel animated />
                            <div>
                                <h2 className="text-base font-bold text-slate-900">{s.station.name}</h2>
                                <p className="text-xs text-slate-400">{s.station.massif}</p>
                                <p className="text-xs text-slate-400">{s.station.altitudeMin}–{s.station.altitudeMax}m · {s.station.kmPistes}km</p>
                            </div>
                            {s.tags.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1">
                                    {s.tags.slice(0, 3).map((tag) => (
                                        <TagBadge key={tag.id} tag={tag} size="sm" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Scores détaillés */}
                        <div className="space-y-2">
                            {rows.map((row) => (
                                <div key={row.key}>
                                    <p className="text-[11px] text-slate-400 mb-1">{row.label}</p>
                                    <ScoreBar value={s.score[row.key]} color={scoreColors[row.key]} />
                                </div>
                            ))}
                        </div>

                        {/* Prévisions 7j */}
                        <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">7 jours</p>
                            <WeekForecast station={s} />
                        </div>

                        {/* Lien détail */}
                        <Link
                            href={`/station/${s.station.slug}`}
                            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-50 transition-colors"
                        >
                            Voir le détail →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
