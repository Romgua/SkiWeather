import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { stations } from "@/lib/stations";
import { getScoredStationBySlug, getScoredStations } from "@/lib/data-service";
import { getWeatherDescription } from "@/lib/weather-codes";

// Revalidation ISR : 3h
export const revalidate = 10800;

// Génère les routes statiques pour toutes les stations
export async function generateStaticParams() {
  return stations.map((s) => ({ slug: s.slug }));
}

// Metadata dynamique SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const station = stations.find((s) => s.slug === slug);
  if (!station) return { title: "Station introuvable" };

  return {
    title: `${station.name} — Conditions ski & météo | SkiWeather`,
    description: `Prévisions ski 7 jours pour ${station.name} (${station.massif}). Neige, vent, enneigement et score de ski.`,
    openGraph: {
      title: `${station.name} — Conditions ski`,
      description: `Score ski, neige et météo 7j pour ${station.name}`,
    },
  };
}

// Couleur dynamique selon le score
function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-glacier-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-glacier-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

// Composant barre de détail score
function ScoreDetailBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="score-bar mt-1">
        <div
          className={`score-bar-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default async function StationPage({
  params,
}: {
    params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getScoredStationBySlug(slug);

  if (!data) notFound();

  const { station, weather, score, dailyScores, tags } = data;

  // Cumul neige 3j et 7j
  const snow3j = weather.daily
    .slice(0, 3)
    .reduce((s, d) => s + d.snowfallCm, 0);
  const snow7j = weather.daily.reduce((s, d) => s + d.snowfallCm, 0);

  return (
    <div className="animate-fade-in">
      {/* Bouton retour */}
      <a
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
      >
        ← Retour au classement
      </a>

      {/* En-tête station */}
      <div className="card-glass p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                {station.name}
              </h1>
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="tag-badge"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: `${tag.color}40`,
                    borderWidth: "1px",
                  }}
                >
                  {tag.emoji} {tag.label}
                </span>
              ))}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {station.massif} • {station.region}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {station.altitudeMin}m → {station.altitudeMax}m •{" "}
              {station.kmPistes}km de pistes
            </p>
          </div>

          {/* Score global */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-4xl font-black ${scoreColor(score.total)}`}>
                {score.total}
              </p>
              <p className="text-xs text-slate-500">/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card-glass p-4 text-center">
          <p className="text-xs text-slate-500">Neige 3j</p>
          <p className="text-xl font-bold text-white">
            {snow3j.toFixed(0)}cm
          </p>
        </div>
        <div className="card-glass p-4 text-center">
          <p className="text-xs text-slate-500">Neige 7j</p>
          <p className="text-xl font-bold text-white">
            {snow7j.toFixed(0)}cm
          </p>
        </div>
        <div className="card-glass p-4 text-center">
          <p className="text-xs text-slate-500">Altitude max</p>
          <p className="text-xl font-bold text-white">
            {station.altitudeMax}m
          </p>
        </div>
        <div className="card-glass p-4 text-center">
          <p className="text-xs text-slate-500">Km pistes</p>
          <p className="text-xl font-bold text-white">
            {station.kmPistes}km
          </p>
        </div>
      </div>

      {/* Détail scoring */}
      <div className="mt-4 card-glass p-6">
        <h2 className="mb-4 text-lg font-bold text-white">
          📊 Détail du score
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ScoreDetailBar
            label="❄️ Neige fraîche"
            value={score.snow}
            color="bg-cyan-400"
          />
          <ScoreDetailBar
            label="🏔️ Enneigement"
            value={score.snowpack}
            color="bg-blue-400"
          />
          <ScoreDetailBar
            label="☀️ Météo"
            value={score.weather}
            color="bg-amber-400"
          />
          <ScoreDetailBar
            label="💨 Vent"
            value={score.wind}
            color="bg-emerald-400"
          />
          <ScoreDetailBar
            label="🎿 Ouverture"
            value={score.opening}
            color="bg-purple-400"
          />
        </div>
      </div>

      {/* Prévisions 7 jours */}
      <div className="mt-4 card-glass p-6">
        <h2 className="mb-4 text-lg font-bold text-white">
          📅 Prévisions 7 jours
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {weather.daily.map((day, index) => {
              const desc = getWeatherDescription(day.weatherCode);
              const dayScore = dailyScores[index];
              const dateObj = new Date(day.date);
              const dayName = dateObj.toLocaleDateString("fr-FR", {
                weekday: "short",
              });
              const dayNum = dateObj.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              });

              return (
                <div
                  key={day.date}
                  className={`flex min-w-[130px] flex-col items-center rounded-xl border p-4 ${
                    index === 0
                      ? "border-glacier-500/40 bg-glacier-500/10"
                      : "border-slate-800 bg-slate-900/50"
                  }`}
                >
                  {/* Jour */}
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    {dayName}
                  </p>
                  <p className="text-[10px] text-slate-500">{dayNum}</p>

                  {/* Icône météo */}
                  <span className="my-2 text-3xl">{desc.icon}</span>
                  <p className="text-[10px] text-slate-400 text-center leading-tight">
                    {desc.label}
                  </p>

                  {/* Températures */}
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="text-red-400">
                      {Math.round(day.temperatureMaxC)}°
                    </span>
                    <span className="text-blue-400">
                      {Math.round(day.temperatureMinC)}°
                    </span>
                  </div>

                  {/* Neige */}
                  {day.snowfallCm > 0 && (
                    <p className="mt-1 text-xs font-bold text-cyan-400">
                      ❄️ {day.snowfallCm.toFixed(1)}cm
                    </p>
                  )}

                  {/* Vent */}
                  <p className="mt-1 text-[10px] text-slate-500">
                    💨 {Math.round(day.windSpeedMaxKmh)}km/h
                  </p>

                  {/* Score du jour */}
                  {dayScore && (
                    <div className="mt-2 flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${scoreBg(dayScore.score)}`}
                      />
                      <span
                        className={`text-xs font-bold ${scoreColor(dayScore.score)}`}
                      >
                        {dayScore.score}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liens utiles */}
      <div className="mt-4 card-glass p-6">
        <h2 className="mb-3 text-lg font-bold text-white">🔗 Liens utiles</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://meteofrance.com/meteo-montagne/alpes-du-nord/risques-avalanche`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-glacier-500 hover:text-white"
          >
            📋 BRA Météo France
          </a>
          <a
            href={`https://www.snow-forecast.com/resorts/${station.slug}/6day/mid`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-glacier-500 hover:text-white"
          >
            🌨️ Snow Forecast
          </a>
          <a
            href={`https://www.skiinfo.fr/alpes-du-nord/${station.slug}/bulletin-neige.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-glacier-500 hover:text-white"
          >
            ⛷️ Skiinfo
          </a>
        </div>
      </div>
    </div>
  );
}
