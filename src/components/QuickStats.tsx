import type { ScoredStation } from "@/lib/types";

interface QuickStatsProps {
  stations: ScoredStation[];
}

export function QuickStats({ stations }: QuickStatsProps) {
  if (stations.length === 0) return null;

  // Station avec le plus de neige fraîche sur 3j
  const mostSnow = [...stations].sort((a, b) => {
    const snowA = a.weather.daily
      .slice(0, 3)
      .reduce((s, d) => s + d.snowfallCm, 0);
    const snowB = b.weather.daily
      .slice(0, 3)
      .reduce((s, d) => s + d.snowfallCm, 0);
    return snowB - snowA;
  })[0];

  const mostSnowCm = mostSnow.weather.daily
    .slice(0, 3)
    .reduce((s, d) => s + d.snowfallCm, 0);

  // Station la plus haute
  const highest = [...stations].sort(
    (a, b) => b.station.altitudeMax - a.station.altitudeMax
  )[0];

  // Station la moins ventée
  const calmest = [...stations].sort((a, b) => {
    const windA = Math.max(...a.weather.daily.map((d) => d.windSpeedMaxKmh));
    const windB = Math.max(...b.weather.daily.map((d) => d.windSpeedMaxKmh));
    return windA - windB;
  })[0];

  const calmestWind = Math.max(
    ...calmest.weather.daily.map((d) => d.windSpeedMaxKmh)
  );

  // Meilleur score
  const avgScore =
    Math.round(
      stations.reduce((sum, s) => sum + s.score.total, 0) / stations.length
    );

  const stats = [
    {
      emoji: "❄️",
      label: "Plus de neige",
      value: `${mostSnowCm.toFixed(0)}cm`,
      detail: mostSnow.station.name,
    },
    {
      emoji: "🏔️",
      label: "Plus haute",
      value: `${highest.station.altitudeMax}m`,
      detail: highest.station.name,
    },
    {
      emoji: "💨",
      label: "Plus calme",
      value: `${Math.round(calmestWind)}km/h`,
      detail: calmest.station.name,
    },
    {
      emoji: "📊",
      label: "Score moyen",
      value: `${avgScore}/100`,
      detail: `${stations.length} stations`,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card-glass p-3 text-center"
        >
          <span className="text-xl">{stat.emoji}</span>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
            {stat.label}
          </p>
          <p className="text-lg font-bold text-white">{stat.value}</p>
          <p className="text-[10px] text-slate-400 truncate">{stat.detail}</p>
        </div>
      ))}
    </div>
  );
}
