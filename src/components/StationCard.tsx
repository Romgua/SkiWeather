"use client";

import Link from "next/link";
import type { ScoredStation } from "@/lib/types";
import { TagBadge } from "./TagBadge";
import { getWeatherDescription } from "@/lib/weather-codes";

interface StationCardProps {
    station: ScoredStation;
    rank: number;
    dayIndex?: number;
    isComparing?: boolean;
    canAddToCompare?: boolean;
    onCompareToggle?: (slug: string) => void;
}

function ScorePill({ score }: { score: number }) {
    const bg = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-400";
    const label = score >= 85 ? "Top !" : score >= 70 ? "Excellent" : score >= 55 ? "Très bon" : score >= 40 ? "Bon" : "Moyen";
    return (
        <div className={`shrink-0 h-14 w-14 rounded-2xl ${bg} flex flex-col items-center justify-center shadow-sm`}>
            <span className="text-xl font-bold font-mono text-white leading-none">{score}</span>
            <span className="text-[9px] font-semibold text-white/80 mt-0.5">{label}</span>
        </div>
    );
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

    const dayData = daily[dayIndex] ?? daily[0];
    const dayScore = dailyScores[dayIndex]?.score ?? score.total;
    const snowDay = dayData?.snowfallCm ?? 0;
    const snow3j = daily.slice(dayIndex, dayIndex + 3).reduce((s, d) => s + (d?.snowfallCm ?? 0), 0);
    const desc = getWeatherDescription(dayData?.weatherCode ?? 0);
    const wind = dayData?.windSpeedMaxKmh ?? 0;
    const temp = Math.round(dayData?.temperatureMaxC ?? 0);

    const borderColor = dayScore >= 70 ? "border-l-emerald-400" : dayScore >= 40 ? "border-l-amber-400" : "border-l-red-300";

    return (
        <div className={`card-hover border-l-4 ${borderColor} ${isComparing ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}>
            <div className="flex items-center gap-3 p-3 sm:p-4">

                {/* Score pill */}
                <Link href={`/station/${station.slug}${dayIndex > 0 ? `?day=${dayIndex}` : ""}`} className="shrink-0">
                    <ScorePill score={dayScore} />
                </Link>

                {/* Infos station */}
                <Link href={`/station/${station.slug}${dayIndex > 0 ? `?day=${dayIndex}` : ""}`} className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="text-xs font-bold text-slate-300">#{rank}</span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{station.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{station.massif} · {station.altitudeMin}–{station.altitudeMax}m · {station.kmPistes}km</p>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {tags.slice(0, 2).map((tag) => <TagBadge key={tag.id} tag={tag} size="sm" />)}
                        </div>
                    )}
                </Link>

                {/* Météo — 3 métriques */}
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                    <div className="flex flex-col items-center min-w-[40px] px-2 py-1.5 rounded-xl bg-slate-50">
                        <span className="text-lg leading-none">{desc.icon}</span>
                        <span className="text-xs font-bold text-slate-700 mt-0.5">{temp}°</span>
                    </div>
                    <div className="flex flex-col items-center min-w-[44px] px-2 py-1.5 rounded-xl bg-blue-50">
                        <span className="text-sm font-bold text-blue-700">{Math.round(snow3j)}<span className="text-[9px]">cm</span></span>
                        <span className="text-[9px] text-blue-400">neige 3j</span>
                    </div>
                    <div className={`flex flex-col items-center min-w-[44px] px-2 py-1.5 rounded-xl ${wind > 60 ? "bg-red-50" : wind > 40 ? "bg-amber-50" : "bg-slate-50"}`}>
                        <span className={`text-sm font-bold ${wind > 60 ? "text-red-600" : wind > 40 ? "text-amber-600" : "text-slate-600"}`}>{Math.round(wind)}<span className="text-[9px]">km/h</span></span>
                        <span className={`text-[9px] ${wind > 60 ? "text-red-400" : wind > 40 ? "text-amber-400" : "text-slate-400"}`}>vent</span>
                    </div>
                </div>

                {/* Bouton comparer bien visible */}
                {onCompareToggle && (
                    <button
                        onClick={(e) => { e.preventDefault(); onCompareToggle(station.slug); }}
                        disabled={!isComparing && !canAddToCompare}
                        title={isComparing ? "Retirer de la comparaison" : "Ajouter à la comparaison"}
                        className={`shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold border transition-all ${
                            isComparing
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                                : canAddToCompare
                                    ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                                    : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        }`}
                    >
                        <span className="text-base leading-none">{isComparing ? "✓" : "+"}</span>
                        <span className="hidden md:inline">{isComparing ? "Sélectionné" : "Comparer"}</span>
                    </button>
                )}

                {/* Flèche */}
                <Link href={`/station/${station.slug}${dayIndex > 0 ? `?day=${dayIndex}` : ""}`} className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
