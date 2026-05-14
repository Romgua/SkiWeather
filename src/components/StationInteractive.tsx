"use client";

import { useState } from "react";
import type { DailyForecast, DailyScore, ScoreBreakdown } from "@/lib/types";
import { getWeatherDescription } from "@/lib/weather-codes";

// ─── Prévisions 7 jours avec sélection ───────────────────────────────────────

const SHORT_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const SHORT_MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];
const BAR_MAX_PX = 80;

function scoreColor(s: number) {
    return s >= 70 ? "text-emerald-600" : s >= 40 ? "text-amber-600" : "text-red-500";
}
function scoreBg(s: number) {
    return s >= 70
        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
        : s >= 40
            ? "bg-amber-100 border-amber-300 text-amber-800"
            : "bg-red-100 border-red-300 text-red-700";
}
function barColor(val: number) {
    return val >= 70 ? "bg-emerald-500" : val >= 40 ? "bg-amber-400" : "bg-red-400";
}

// ─── Breakdown journalier ──────────────────────────────────────────────────────
function DailyBreakdown({ daily, dailyScores, overallScore }: {
    daily: DailyForecast[];
    dailyScores: DailyScore[];
    overallScore: ScoreBreakdown;
    selectedDay: number;
}) {
    // Not used directly — parent handles selectedDay
    return null;
}

// ─── Section prévisions ────────────────────────────────────────────────────────
export function StationInteractive({ daily, dailyScores, overallScore, initialDay = 0 }: {
    daily: DailyForecast[];
    dailyScores: DailyScore[];
    overallScore: ScoreBreakdown;
    initialDay?: number;
}) {
    const [selected, setSelected] = useState(initialDay);

    const day = daily[selected];
    const ds = dailyScores[selected];
    const desc = getWeatherDescription(day?.weatherCode ?? 0);

    // Score breakdown pour ce jour
    const breakdown: ScoreBreakdown = {
        total: ds?.score ?? overallScore.total,
        snow: ds?.snowScore ?? overallScore.snow,
        weather: ds?.weatherScore ?? overallScore.weather,
        wind: ds?.windScore ?? overallScore.wind,
        snowpack: overallScore.snowpack,  // constant (pas de données par jour)
        opening: overallScore.opening,    // constant
    };

    // Données barres neige
    const snowData = daily.slice(0, 7).map(d => d.snowfallCm);
    const maxSnow = Math.max(...snowData, 1);
    const totalSnow = snowData.reduce((a, b) => a + b, 0);

    // Fond de la carte détail selon météo
    const detailBg = desc.category === "clear"
        ? "from-amber-50 to-sky-100"
        : desc.category === "snow"
            ? "from-sky-100 to-blue-100"
            : desc.category === "rain"
                ? "from-slate-100 to-blue-100"
                : "from-sky-50 to-slate-100";

    const categories = [
        { key: "snow" as const,     label: "Neige fraîche", emoji: "❄️",  weight: "25%" },
        { key: "snowpack" as const, label: "Enneigement",   emoji: "⛷️",  weight: "25%" },
        { key: "weather" as const,  label: "Météo",         emoji: "☀️",  weight: "30%" },
        { key: "wind" as const,     label: "Vent",          emoji: "💨",  weight: "10%" },
        { key: "opening" as const,  label: "Ouverture",     emoji: "🚡",  weight: "10%" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche — prévisions */}
            <div className="lg:col-span-2 space-y-4">

                {/* Tuiles de sélection */}
                <div className="card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Prévisions 7 jours</p>
                    <div className="grid grid-cols-7 gap-1.5">
                        {daily.slice(0, 7).map((d, i) => {
                            const dt = new Date(d.date + "T12:00:00");
                            const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
                            const isSelected = selected === i;
                            const ds2 = dailyScores[i];
                            const desc2 = getWeatherDescription(d.weatherCode);
                            return (
                                <button
                                    key={d.date}
                                    onClick={() => setSelected(i)}
                                    className={`flex flex-col items-center gap-0.5 rounded-2xl py-3 px-1 transition-all ${
                                        isSelected
                                            ? "bg-blue-700 text-white shadow-md shadow-blue-200"
                                            : isWeekend
                                                ? "bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100"
                                                : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <span className={`text-[9px] font-semibold uppercase tracking-wide ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                                        {i === 0 ? "Auj" : SHORT_DAYS[dt.getDay()]}
                                    </span>
                                    <span className={`text-base font-bold leading-none mt-0.5 ${isSelected ? "text-white" : "text-slate-800"}`}>
                                        {dt.getDate()}
                                    </span>
                                    <span className="text-xl mt-0.5">{desc2.icon}</span>
                                    {ds2 && (
                                        <span className={`text-[9px] font-bold font-mono mt-0.5 ${isSelected ? "text-blue-200" : scoreColor(ds2.score)}`}>
                                            {ds2.score}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Carte détail du jour sélectionné */}
                {day && (
                    <div className={`rounded-3xl bg-gradient-to-br ${detailBg} border border-slate-100 p-5`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <span className="text-5xl">{desc.icon}</span>
                                <div>
                                    <p className="font-semibold text-slate-700">{desc.label}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-slate-900">{Math.round(day.temperatureMaxC)}°</span>
                                        <span className="text-lg text-slate-400">/ {Math.round(day.temperatureMinC)}°</span>
                                    </div>
                                </div>
                            </div>
                            {ds && (
                                <div className={`rounded-2xl border-2 px-4 py-2 text-center ${scoreBg(ds.score)}`}>
                                    <p className="text-2xl font-bold font-mono">{ds.score}</p>
                                    <p className="text-[9px] uppercase tracking-wide font-semibold">score/100</p>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { label: "Neige", value: day.snowfallCm > 0 ? `${Math.round(day.snowfallCm)} cm` : "Aucune", color: "text-blue-700" },
                                { label: "Vent max", value: `${Math.round(day.windSpeedMaxKmh)} km/h`, color: day.windSpeedMaxKmh > 60 ? "text-red-600" : day.windSpeedMaxKmh > 40 ? "text-amber-600" : "text-emerald-700" },
                                { label: "Risque pluie", value: `${Math.round(day.precipitationProbability ?? 0)}%`, color: "text-slate-700" },
                                { label: "Ensoleillement", value: `${Math.round(day.sunshineDurationH ?? 0)}h`, color: "text-amber-600" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="rounded-xl bg-white/70 px-3 py-2.5 text-center">
                                    <p className={`text-base font-bold font-mono ${color}`}>{value}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Barres neige */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Neige prévue (cm)</h3>
                        <span className="text-xs font-semibold text-blue-600">{Math.round(totalSnow)} cm total sur 7j</span>
                    </div>
                    {totalSnow === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <span className="text-3xl mb-2">☀️</span>
                            <p className="text-sm font-semibold text-slate-600">Aucune chute de neige prévue</p>
                            <p className="text-xs text-slate-400 mt-1">Bonnes conditions de ski sur neige transformée</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2 items-end" style={{ height: `${BAR_MAX_PX + 20}px` }}>
                                {snowData.map((snow, i) => {
                                    const dt = new Date(daily[i].date + "T12:00:00");
                                    const barH = snow > 0 ? Math.max(6, Math.round((snow / maxSnow) * BAR_MAX_PX)) : 0;
                                    const isToday = i === selected;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelected(i)}
                                            className="flex-1 flex flex-col items-center justify-end gap-1 cursor-pointer"
                                            style={{ height: "100%" }}
                                        >
                                            {snow > 0 && (
                                                <span className={`text-[10px] font-bold leading-none ${isToday ? "text-blue-700" : "text-blue-500"}`}>{Math.round(snow)}</span>
                                            )}
                                            <div
                                                className={`w-full rounded-t-lg transition-all ${
                                                    snow > 0
                                                        ? isToday ? "bg-blue-700 shadow-md" : "bg-gradient-to-t from-blue-500 to-sky-300"
                                                        : "bg-slate-100"
                                                }`}
                                                style={{ height: snow > 0 ? `${barH}px` : "4px" }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex gap-2 mt-1.5">
                                {snowData.map((_, i) => {
                                    const dt = new Date(daily[i].date + "T12:00:00");
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center">
                                            <span className="text-[10px] font-semibold text-slate-600">{i === 0 ? "Auj" : SHORT_DAYS[dt.getDay()]}</span>
                                            <span className="text-[9px] text-slate-400">{dt.getDate()} {SHORT_MONTHS[dt.getMonth()]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Colonne droite — score mis à jour selon le jour */}
            <div className="space-y-4">
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Détail du score</h3>
                        <div className={`rounded-xl border px-3 py-1 ${scoreBg(breakdown.total)}`}>
                            <span className="text-lg font-bold font-mono">{breakdown.total}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {categories.map(({ key, label, emoji, weight }) => {
                            const value = breakdown[key];
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-slate-600 font-medium">{emoji} {label} <span className="text-slate-400">({weight})</span></span>
                                        <span className={`font-bold font-mono ${scoreColor(value)}`}>{value}</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${barColor(value)}`} style={{ width: `${value}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Verdict */}
                    <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-sm font-semibold text-slate-700 mb-1">Verdict</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {breakdown.total >= 75
                                ? <><span className="font-bold text-emerald-600">{breakdown.total}/100</span> — Conditions excellentes, foncez !</>
                                : breakdown.total >= 50
                                    ? <><span className="font-bold text-sky-600">{breakdown.total}/100</span> — Bonnes conditions pour une sortie.</>
                                    : <><span className="font-bold text-amber-600">{breakdown.total}/100</span> — Conditions mitigées ce jour-là.</>
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
