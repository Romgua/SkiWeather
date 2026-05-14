"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ScoredStation } from "@/lib/types";
import { getWeatherDescription } from "@/lib/weather-codes";

interface RecommendationBannerProps {
    stations: ScoredStation[];
    selectedDay: number;
}

function getDayLabel(dayIndex: number, stations: ScoredStation[]): string {
    const date = stations[0]?.weather.daily[dayIndex]?.date;
    if (!date) return "ce jour";
    const d = new Date(date + "T12:00:00");
    if (dayIndex === 0) return "aujourd'hui";
    if (dayIndex === 1) return "demain";
    return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function getAccroche(top: ScoredStation, dayIndex: number): string {
    const daily = top.weather.daily[dayIndex];
    if (!daily) return "bonnes conditions globales";
    const snow = daily.snowfallCm ?? 0;
    const wind = daily.windSpeedMaxKmh ?? 0;
    const wCode = daily.weatherCode ?? 0;
    const desc = getWeatherDescription(wCode);

    if (snow >= 15) return `${Math.round(snow)} cm de neige fraîche attendus`;
    if (snow >= 5) return `${Math.round(snow)} cm de neige prévus`;
    if (desc.category === "clear" && wind < 30) return "grand beau temps prévu";
    if (desc.category === "clear") return "ciel dégagé malgré le vent";
    if (wind > 60) return "⚠️ vent fort — vérifier avant de partir";
    return "bonnes conditions globales";
}

function getScoreColor(score: number): string {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-500";
}

function getScoreBg(score: number): string {
    if (score >= 70) return "bg-emerald-50 border-emerald-200";
    if (score >= 40) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
}

export function RecommendationBanner({ stations, selectedDay }: RecommendationBannerProps) {
    const top3 = useMemo(() => {
        return [...stations]
            .sort((a, b) => {
                const sa = a.dailyScores[selectedDay]?.score ?? a.score.total;
                const sb = b.dailyScores[selectedDay]?.score ?? b.score.total;
                return sb - sa;
            })
            .slice(0, 3);
    }, [stations, selectedDay]);

    if (top3.length === 0) return null;

    const top = top3[0];
    const topScore = top.dailyScores[selectedDay]?.score ?? top.score.total;
    const dayLabel = getDayLabel(selectedDay, stations);
    const accroche = getAccroche(top, selectedDay);

    return (
        <div className={`card border p-4 sm:p-5 ${getScoreBg(topScore)}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icône */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl">
                    {topScore >= 70 ? "🏆" : topScore >= 40 ? "⛷️" : "🌥️"}
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Recommandation — {dayLabel}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        Direction{" "}
                        <Link href={`/station/${top.station.slug}`} className="text-blue-700 hover:underline">
                            {top.station.name}
                        </Link>
                        {" "}
                        <span className={`font-bold ${getScoreColor(topScore)}`}>({topScore}/100)</span>
                        {" — "}
                        <span className="font-normal text-slate-700">{accroche}</span>
                    </p>
                </div>

                {/* Top 3 */}
                <div className="flex gap-2 shrink-0">
                    {top3.map((s, i) => {
                        const sc = s.dailyScores[selectedDay]?.score ?? s.score.total;
                        return (
                            <Link key={s.station.id} href={`/station/${s.station.slug}`}>
                                <div className="flex flex-col items-center gap-1 rounded-xl bg-white/80 px-3 py-2 shadow-sm hover:bg-white transition-colors">
                                    <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                                    <span className={`text-base font-bold font-mono ${getScoreColor(sc)}`}>{sc}</span>
                                    <span className="text-[10px] text-slate-500 text-center leading-tight max-w-[60px] truncate">
                                        {s.station.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
