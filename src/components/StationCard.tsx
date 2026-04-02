import Link from "next/link";
import type { ScoredStation } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { TagBadge } from "./TagBadge";
import { SnowChart } from "./SnowChart";
import { getWeatherDescription } from "@/lib/weather-codes";

interface StationCardProps {
    station: ScoredStation;
    rank: number;
    dayIndex?: number;
    isComparing?: boolean;
    canAddToCompare?: boolean;
    onCompareToggle?: (slug: string) => void;
}

export function StationCard({
    station: scored,
    rank,
    dayIndex = 0,
    isComparing = false,
    canAddToCompare = true,
    onCompareToggle,
}: StationCardProps) {
    const { station, weather, score, tags, dailyScores } = scored;
    const daily = weather.daily;

    // Données du jour sélectionné
    const dayData = daily[dayIndex] ?? daily[0];
    const dayScore = dailyScores[dayIndex]?.score ?? score.total;
    const snow3j = daily.slice(dayIndex, dayIndex + 3).reduce((s, d) => s + (d?.snowfallCm ?? 0), 0);
    const todayWeather = getWeatherDescription(dayData?.weatherCode ?? 0);
    const windMax = dayData?.windSpeedMaxKmh ?? 0;

    const showCompareBtn = !!onCompareToggle;

    const borderColor = dayScore >= 70
        ? "border-l-4 border-l-emerald-400"
        : dayScore >= 40
            ? "border-l-4 border-l-amber-400"
            : "border-l-4 border-l-red-300";

    return (
        <div className={`card-hover p-4 sm:p-5 ${borderColor} ${isComparing ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}>
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Rank */}
                <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
                    {rank}
                </div>

                {/* Score */}
                <Link href={`/station/${station.slug}`} className="shrink-0">
                    <ScoreBadge score={dayScore} size="sm" animated={false} />
                </Link>

                {/* Info */}
                <Link href={`/station/${station.slug}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-slate-900 truncate">{station.name}</h3>
                        <span className="hidden sm:inline text-xs text-slate-400">{station.massif}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{station.altitudeMin}–{station.altitudeMax}m</span>
                        <span>·</span>
                        <span>{station.kmPistes}km</span>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {tags.slice(0, 2).map((tag) => (
                                <TagBadge key={tag.id} tag={tag} size="sm" />
                            ))}
                        </div>
                    )}
                </Link>

                {/* Météo du jour sélectionné */}
                <div className="hidden md:flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl" title={todayWeather.label}>{todayWeather.icon}</span>
                        <span className="text-xs font-mono text-slate-600">
                            {Math.round(dayData?.temperatureMaxC ?? 0)}°
                        </span>
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-bold font-mono text-blue-600">
                            {Math.round(snow3j)}
                            <span className="text-[10px] text-slate-400">cm</span>
                        </p>
                        <p className="text-[9px] text-slate-400">neige 3j</p>
                    </div>

                    <div className="hidden lg:block">
                        <SnowChart daily={daily} width={80} height={28} highlightIndex={dayIndex} />
                    </div>

                    <div className="text-center">
                        <p className={`text-sm font-bold font-mono ${
                            windMax > 60 ? "text-red-500" : windMax > 40 ? "text-amber-500" : "text-slate-500"
                        }`}>
                            {Math.round(windMax)}
                            <span className="text-[10px] text-slate-400">km/h</span>
                        </p>
                        <p className="text-[9px] text-slate-400">vent</p>
                    </div>
                </div>

                {/* Bouton comparer + flèche */}
                <div className="flex items-center gap-2 shrink-0">
                    {showCompareBtn && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onCompareToggle(station.slug);
                            }}
                            disabled={!isComparing && !canAddToCompare}
                            title={isComparing ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                isComparing
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : canAddToCompare
                                        ? "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                                        : "bg-slate-50 text-slate-300 cursor-not-allowed"
                            }`}
                        >
                            {isComparing ? "✓" : "+"}
                        </button>
                    )}
                    <Link href={`/station/${station.slug}`} className="text-slate-300 hover:text-slate-500">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
