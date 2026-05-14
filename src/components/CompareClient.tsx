"use client";

import { useState } from "react";
import Link from "next/link";
import type { ScoredStation, ScoreBreakdown } from "@/lib/types";
import { getWeatherDescription } from "@/lib/weather-codes";
import { DateSelector } from "./DateSelector";
import { TagBadge } from "./TagBadge";

interface CompareClientProps {
    stations: ScoredStation[];
}

const SCORE_ROWS: { key: keyof ScoreBreakdown; label: string; emoji: string; daily: boolean }[] = [
    { key: "total",    label: "Score global",  emoji: "🏆", daily: true },
    { key: "snow",     label: "Neige fraîche", emoji: "❄️", daily: true },
    { key: "snowpack", label: "Enneigement",   emoji: "⛷️", daily: false },
    { key: "weather",  label: "Météo",         emoji: "☀️", daily: true },
    { key: "wind",     label: "Vent",          emoji: "💨", daily: true },
    { key: "opening",  label: "Ouverture",     emoji: "🚡", daily: false },
];

const BAR_COLORS: Record<string, string> = {
    total: "bg-blue-500", snow: "bg-sky-400", snowpack: "bg-indigo-400",
    weather: "bg-amber-400", wind: "bg-emerald-400", opening: "bg-teal-400",
};

const SHORT_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function scoreColor(s: number) {
    return s >= 70 ? "text-emerald-600" : s >= 40 ? "text-amber-600" : "text-red-500";
}
function scoreBg(s: number) {
    return s >= 70 ? "bg-emerald-500" : s >= 40 ? "bg-amber-400" : "bg-red-400";
}

export function CompareClient({ stations }: CompareClientProps) {
    const [selectedDay, setSelectedDay] = useState(0);
    const availableDays = stations[0]?.weather.daily.length ?? 7;

    return (
        <div className="space-y-6">
            {/* Sélecteur de date */}
            <DateSelector
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
                availableDays={availableDays}
            />

            {/* Grille de comparaison */}
            <div className={`grid gap-4 ${stations.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {stations.map((s) => {
                    const ds = s.dailyScores[selectedDay];
                    const dayData = s.weather.daily[selectedDay];
                    const desc = getWeatherDescription(dayData?.weatherCode ?? 0);
                    const dayScore = ds?.score ?? s.score.total;

                    // Breakdown pour ce jour
                    const breakdown: ScoreBreakdown = {
                        total: dayScore,
                        snow: ds?.snowScore ?? s.score.snow,
                        weather: ds?.weatherScore ?? s.score.weather,
                        wind: ds?.windScore ?? s.score.wind,
                        snowpack: s.score.snowpack,
                        opening: s.score.opening,
                    };

                    return (
                        <div key={s.station.id} className="card overflow-hidden">
                            {/* Header coloré selon score */}
                            <div className={`${scoreBg(dayScore)} p-4 text-white text-center`}>
                                <div className="text-4xl font-bold font-mono">{dayScore}</div>
                                <div className="text-white/80 text-xs font-semibold mt-0.5">
                                    {dayScore >= 70 ? "Excellent" : dayScore >= 40 ? "Bon" : "Moyen"}
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Nom + infos */}
                                <div className="text-center">
                                    <h2 className="text-base font-bold text-slate-900">{s.station.name}</h2>
                                    <p className="text-xs text-slate-400">{s.station.massif} · {s.station.altitudeMin}–{s.station.altitudeMax}m · {s.station.kmPistes}km</p>
                                    {s.tags.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                                            {s.tags.slice(0, 2).map(tag => <TagBadge key={tag.id} tag={tag} size="sm" />)}
                                        </div>
                                    )}
                                </div>

                                {/* Météo du jour sélectionné */}
                                {dayData && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-slate-50 p-2 text-center">
                                            <div className="text-2xl">{desc.icon}</div>
                                            <div className="text-sm font-bold text-slate-800">{Math.round(dayData.temperatureMaxC)}°</div>
                                            <div className="text-[9px] text-slate-400">temp max</div>
                                        </div>
                                        <div className="rounded-xl bg-blue-50 p-2 text-center">
                                            <div className="text-sm font-bold text-blue-700 mt-1">{Math.round(dayData.snowfallCm)} cm</div>
                                            <div className="text-[9px] text-blue-400">neige prévue</div>
                                        </div>
                                        <div className={`rounded-xl p-2 text-center ${dayData.windSpeedMaxKmh > 60 ? "bg-red-50" : "bg-slate-50"}`}>
                                            <div className={`text-sm font-bold mt-1 ${dayData.windSpeedMaxKmh > 60 ? "text-red-600" : "text-slate-700"}`}>
                                                {Math.round(dayData.windSpeedMaxKmh)} km/h
                                            </div>
                                            <div className="text-[9px] text-slate-400">vent</div>
                                        </div>
                                        <div className="rounded-xl bg-amber-50 p-2 text-center">
                                            <div className="text-sm font-bold text-amber-700 mt-1">{Math.round(dayData.sunshineDurationH ?? 0)}h</div>
                                            <div className="text-[9px] text-amber-400">soleil</div>
                                        </div>
                                    </div>
                                )}

                                {/* Scores détaillés */}
                                <div className="space-y-2">
                                    {SCORE_ROWS.map(({ key, label, emoji, daily }) => {
                                        const value = breakdown[key];
                                        return (
                                            <div key={key}>
                                                <div className="flex justify-between text-[11px] mb-1">
                                                    <span className="text-slate-500">{emoji} {label}{!daily && <span className="text-slate-300 ml-1">(global)</span>}</span>
                                                    <span className={`font-bold font-mono ${scoreColor(value)}`}>{value}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${BAR_COLORS[key]}`} style={{ width: `${value}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Mini prévisions 7j */}
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">7 jours</p>
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {s.weather.daily.slice(0, 7).map((day, i) => {
                                            const d2 = getWeatherDescription(day.weatherCode);
                                            const ds2 = s.dailyScores[i];
                                            const isSelected = i === selectedDay;
                                            return (
                                                <button
                                                    key={day.date}
                                                    onClick={() => setSelectedDay(i)}
                                                    className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 px-0.5 transition-all ${
                                                        isSelected ? "bg-blue-700 text-white" : "bg-slate-50 hover:bg-blue-50"
                                                    }`}
                                                >
                                                    <span className={`text-[8px] font-semibold ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                                                        {i === 0 ? "Auj" : SHORT_DAYS[new Date(day.date + "T12:00:00").getDay()]}
                                                    </span>
                                                    <span className="text-sm">{d2.icon}</span>
                                                    {ds2 && (
                                                        <span className={`text-[8px] font-bold font-mono ${isSelected ? "text-blue-200" : scoreColor(ds2.score)}`}>
                                                            {ds2.score}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Link
                                    href={`/station/${s.station.slug}`}
                                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 rounded-xl hover:bg-blue-50 transition-colors border border-blue-100"
                                >
                                    Voir le détail →
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
