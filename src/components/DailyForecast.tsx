"use client";

import { useState } from "react";
import type { DailyForecast, DailyScore } from "@/lib/types";
import { getWeatherDescription } from "@/lib/weather-codes";

interface DailyForecastViewProps {
    daily: DailyForecast[];
    dailyScores: DailyScore[];
}

const SHORT_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function fmt(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00");
    return { short: SHORT_DAYS[d.getDay()], num: d.getDate(), isWeekend: d.getDay() === 0 || d.getDay() === 6 };
}

function scoreColor(s: number) {
    if (s >= 70) return "text-emerald-600";
    if (s >= 40) return "text-amber-600";
    return "text-red-500";
}
function scoreBg(s: number) {
    if (s >= 70) return "bg-emerald-50 border-emerald-200 text-emerald-700";
    if (s >= 40) return "bg-amber-50 border-amber-200 text-amber-700";
    return "bg-red-50 border-red-200 text-red-600";
}

export function DailyForecastView({ daily, dailyScores }: DailyForecastViewProps) {
    const [selected, setSelected] = useState(0);
    const day = daily[selected];
    const ds = dailyScores[selected];
    const desc = getWeatherDescription(day?.weatherCode ?? 0);

    // Couleur de fond de la carte détail selon météo
    const detailBg = desc.category === "clear"
        ? "from-amber-50 to-sky-50"
        : desc.category === "snow"
            ? "from-sky-50 to-blue-50"
            : desc.category === "rain"
                ? "from-slate-50 to-blue-50"
                : "from-slate-50 to-sky-50";

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Prévisions 7 jours</h3>

            {/* Tuiles de sélection */}
            <div className="grid grid-cols-7 gap-1">
                {daily.slice(0, 7).map((d, i) => {
                    const { short, num, isWeekend } = fmt(d.date);
                    const ds2 = dailyScores[i];
                    const isSelected = selected === i;
                    const desc2 = getWeatherDescription(d.weatherCode);
                    return (
                        <button
                            key={d.date}
                            onClick={() => setSelected(i)}
                            className={`flex flex-col items-center gap-0.5 rounded-xl py-2 px-0.5 transition-all ${
                                isSelected
                                    ? "bg-blue-700 text-white shadow-md"
                                    : isWeekend
                                        ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100"
                                        : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-100"
                            }`}
                        >
                            <span className={`text-[9px] font-semibold uppercase tracking-wide ${isSelected ? "text-blue-200" : "text-slate-400"}`}>{i === 0 ? "Auj" : short}</span>
                            <span className={`text-base font-bold leading-none ${isSelected ? "text-white" : "text-slate-800"}`}>{num}</span>
                            <span className="text-lg">{desc2.icon}</span>
                            {ds2 && (
                                <span className={`text-[9px] font-bold font-mono ${isSelected ? "text-blue-200" : scoreColor(ds2.score)}`}>{ds2.score}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Carte détail du jour sélectionné */}
            {day && (
                <div className={`rounded-2xl bg-gradient-to-br ${detailBg} border border-slate-100 p-4`}>
                    <div className="flex items-start justify-between gap-4">
                        {/* Gauche — météo principale */}
                        <div className="flex items-center gap-3">
                            <span className="text-5xl">{desc.icon}</span>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">{desc.label}</p>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-2xl font-bold text-slate-900">{Math.round(day.temperatureMaxC)}°</span>
                                    <span className="text-base text-slate-400">/ {Math.round(day.temperatureMinC)}°</span>
                                </div>
                            </div>
                        </div>

                        {/* Score du jour */}
                        {ds && (
                            <div className={`rounded-xl border px-3 py-1.5 text-center ${scoreBg(ds.score)}`}>
                                <p className="text-xl font-bold font-mono">{ds.score}</p>
                                <p className="text-[9px] uppercase tracking-wide">score</p>
                            </div>
                        )}
                    </div>

                    {/* Détails sur 2 colonnes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="rounded-xl bg-white/70 px-3 py-2 text-center">
                            <p className="text-base font-bold font-mono text-blue-600">
                                {day.snowfallCm > 0 ? `${Math.round(day.snowfallCm)} cm` : "—"}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Neige</p>
                        </div>
                        <div className="rounded-xl bg-white/70 px-3 py-2 text-center">
                            <p className={`text-base font-bold font-mono ${day.windSpeedMaxKmh > 60 ? "text-red-500" : day.windSpeedMaxKmh > 40 ? "text-amber-500" : "text-slate-700"}`}>
                                {Math.round(day.windSpeedMaxKmh)} km/h
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Vent max</p>
                        </div>
                        <div className="rounded-xl bg-white/70 px-3 py-2 text-center">
                            <p className="text-base font-bold font-mono text-slate-700">
                                {Math.round(day.precipitationProbability ?? 0)}%
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Risque pluie</p>
                        </div>
                        <div className="rounded-xl bg-white/70 px-3 py-2 text-center">
                            <p className="text-base font-bold font-mono text-amber-500">
                                {Math.round(day.sunshineDurationH ?? 0)}h
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Ensoleillement</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
