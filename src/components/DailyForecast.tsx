import type { DailyForecast, DailyScore } from "@/lib/types";
import { getWeatherDescription } from "@/lib/weather-codes";

interface DailyForecastViewProps {
    daily: DailyForecast[];
    dailyScores: DailyScore[];
}

function formatDay(dateStr: string): { day: string; date: string } {
    const d = new Date(dateStr + "T12:00:00");
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const day = days[d.getDay()];
    const date = `${d.getDate()}/${d.getMonth() + 1}`;
    return { day, date };
}

function getScoreDotColor(score: number): string {
    if (score >= 80) return "bg-emerald-400";
    if (score >= 60) return "bg-sky-400";
    if (score >= 40) return "bg-amber-400";
    return "bg-orange-400";
}

export function DailyForecastView({
                                      daily,
                                      dailyScores,
                                  }: DailyForecastViewProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-snow-200 uppercase tracking-wider">
                Prévisions 7 jours
            </h3>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
                {daily.slice(0, 7).map((d, i) => {
                    const { day, date } = formatDay(d.date);
                    const desc = getWeatherDescription(d.weatherCode);
                    const score = dailyScores[i];

                    return (
                        <div
                            key={d.date}
                            className={`glass-card p-3 flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center ${
                                i === 0 ? "border-glacier-500/20" : ""
                            }`}
                        >
                            <div className="w-14 sm:w-auto shrink-0">
                                <p className="text-sm font-semibold text-snow-100">{day}</p>
                                <p className="text-[10px] text-snow-300/50">{date}</p>
                            </div>

                            <div className="text-2xl sm:text-3xl sm:my-1" title={desc.label}>
                                {desc.icon}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs sm:flex-col sm:gap-0">
                <span className="font-semibold text-snow-100">
                  {Math.round(d.temperatureMaxC)}°
                </span>
                                <span className="text-snow-300/50">
                  {Math.round(d.temperatureMinC)}°
                </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs">
                                {d.snowfallCm > 0 ? (
                                    <>
                                        <span className="text-glacier-400">❄</span>
                                        <span className="font-mono font-semibold text-glacier-300">
                      {Math.round(d.snowfallCm)}cm
                    </span>
                                    </>
                                ) : (
                                    <span className="text-snow-300/30">—</span>
                                )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-snow-300/60">
                                <span>💨</span>
                                <span className="font-mono">
                  {Math.round(d.windSpeedMaxKmh)}
                </span>
                            </div>

                            {score && (
                                <div className="ml-auto sm:ml-0 flex items-center gap-1">
                                    <div
                                        className={`h-2 w-2 rounded-full ${getScoreDotColor(score.score)}`}
                                    />
                                    <span className="text-[10px] font-mono text-snow-300/50">
                    {score.score}
                  </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
