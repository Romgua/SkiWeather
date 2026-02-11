import type { ScoredStation } from "@/lib/types";
import { ScoreRing } from "./ScoreRing";
import { TagBadge } from "./TagBadge";
import { SnowBar } from "./SnowBar";
import { WeatherRow } from "./WeatherRow";
import { ScoreBreakdownBar } from "./ScoreBreakdownBar";

interface StationCardProps {
  data: ScoredStation;
  rank: number;
}

export function StationCard({ data, rank }: StationCardProps) {
  const { station, weather, score, tags } = data;

  const totalSnow3d = weather.daily
    .slice(0, 3)
    .reduce((sum, d) => sum + d.snowfallCm, 0);

  return (
    <a
      href={`/station/${station.slug}`}
      className="card-glass block p-4 sm:p-5"
    >
      {/* Header : Rank + Name + Score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Rank */}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-slate-300">
            {rank}
          </span>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">
              {station.name}
            </h2>
            <p className="text-xs text-slate-400">
              {station.massif} · {station.altitudeMin}–{station.altitudeMax}m ·{" "}
              {station.kmPistes}km
            </p>
          </div>
        </div>

        <ScoreRing score={score.total} size="md" />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      {/* Stats rapides */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {/* Neige fraîche 3j */}
        <div className="rounded-xl bg-slate-800/50 p-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Neige 3j
          </p>
          <p className="mt-0.5 text-lg font-bold text-glacier-400">
            {totalSnow3d.toFixed(0)}
            <span className="text-xs text-slate-400">cm</span>
          </p>
        </div>

        {/* Vent moyen */}
        <div className="rounded-xl bg-slate-800/50 p-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Vent max
          </p>
          <p className="mt-0.5 text-lg font-bold text-purple-400">
            {Math.round(
              Math.max(...weather.daily.map((d) => d.windSpeedMaxKmh))
            )}
            <span className="text-xs text-slate-400">km/h</span>
          </p>
        </div>

        {/* Altitude max */}
        <div className="rounded-xl bg-slate-800/50 p-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Sommet
          </p>
          <p className="mt-0.5 text-lg font-bold text-white">
            {station.altitudeMax}
            <span className="text-xs text-slate-400">m</span>
          </p>
        </div>
      </div>

      {/* Météo 5 jours + SnowBar */}
      <div className="mt-4 flex items-end justify-between gap-4">
        <WeatherRow forecasts={weather.daily} compact />
        <SnowBar
          days={weather.daily.map((d) => ({
            date: d.date,
            snowfallCm: d.snowfallCm,
          }))}
        />
      </div>

      {/* Score breakdown */}
      <div className="mt-4">
        <ScoreBreakdownBar breakdown={score} />
      </div>
    </a>
  );
}
