import Link from "next/link";
import type { ScoredStation } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { TagBadge } from "./TagBadge";
import { SnowChart } from "./SnowChart";
import { getWeatherDescription } from "@/lib/weather-codes";

interface StationCardProps {
    station: ScoredStation;
    rank: number;
}

export function StationCard({ station: scored, rank }: StationCardProps) {
    const { station, weather, score, tags } = scored;
    const daily = weather.daily;

    const snow3j = daily.slice(0, 3).reduce((s, d) => s + d.snowfallCm, 0);
    const todayWeather = getWeatherDescription(daily[0]?.weatherCode ?? 0);
    const windMax = Math.max(
        ...daily.slice(0, 3).map((d) => d.windSpeedMaxKmh)
    );

    return (
        <Link href={`/station/${station.slug}`}>
            <div className="glass-card-hover p-4 sm:p-5">
                <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-snow-300/50">
                        {rank}
                    </div>

                    {/* Score */}
                    <div className="shrink-0">
                        <ScoreBadge score={score.total} size="sm" animated={false} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-bold text-snow-50 truncate">
                                {station.name}
                            </h3>
                            <span className="hidden sm:inline text-xs text-snow-300/40">
                {station.massif}
              </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-snow-300/50">
              <span>
                {station.altitudeMin}–{station.altitudeMax}m
              </span>
                            <span>·</span>
                            <span>{station.kmPistes}km</span>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {tags.slice(0, 2).map((tag) => (
                                    <TagBadge key={tag.id} tag={tag} size="sm" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Météo rapide */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                        {/* Today weather */}
                        <div className="flex items-center gap-1.5">
              <span className="text-xl" title={todayWeather.label}>
                {todayWeather.icon}
              </span>
                            <span className="text-xs font-mono text-snow-300/60">
                {Math.round(daily[0]?.temperatureMaxC ?? 0)}°
              </span>
                        </div>

                        {/* Snow */}
                        <div className="text-center">
                            <p className="text-sm font-bold font-mono text-glacier-400">
                                {Math.round(snow3j)}
                                <span className="text-[10px] text-snow-300/40">cm</span>
                            </p>
                            <p className="text-[9px] text-snow-300/30">neige 3j</p>
                        </div>

                        {/* Mini chart */}
                        <div className="hidden lg:block">
                            <SnowChart daily={daily} width={80} height={28} />
                        </div>

                        {/* Wind */}
                        <div className="text-center">
                            <p
                                className={`text-sm font-bold font-mono ${
                                    windMax > 60
                                        ? "text-red-400"
                                        : windMax > 40
                                            ? "text-amber-400"
                                            : "text-snow-300/60"
                                }`}
                            >
                                {Math.round(windMax)}
                                <span className="text-[10px] text-snow-300/40">km/h</span>
                            </p>
                            <p className="text-[9px] text-snow-300/30">vent</p>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="shrink-0 text-snow-300/20">
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
