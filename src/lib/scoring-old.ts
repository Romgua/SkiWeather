import type {
  Station,
  StationWeather,
  DailyForecast,
  ScoredStation,
  ScoreBreakdown,
  DailyScore,
  StationTag,
} from "./types";
import { getWeatherDescription, isSnowCode, isClearCode } from "./weather-codes";

// ============================================================
// ALGORITHME DE SCORING SKI — 0 à 100
//
// SCORE = Neige(30%) + Enneigement(25%) + Météo(25%)
//         + Vent(10%) + Ouverture(10%)
//
// En Phase 1, on n'a pas encore les données de scraping,
// donc Enneigement est estimé via cumul neige Open-Meteo
// et Ouverture est estimé via l'altitude + période.
// ============================================================

const WEIGHTS = {
  snow: 0.30,
  snowpack: 0.25,
  weather: 0.25,
  wind: 0.10,
  opening: 0.10,
} as const;

// ──────── SOUS-SCORES UNITAIRES ────────

/**
 * Score neige fraîche (0-100)
 * Cumul des chutes de neige sur les 3 prochains jours
 */
function scoreSnowfall(dailyForecasts: DailyForecast[]): number {
  // Prendre les 3 prochains jours
  const next3Days = dailyForecasts.slice(0, 3);
  const totalCm = next3Days.reduce((sum, d) => sum + d.snowfallCm, 0);

  if (totalCm >= 50) return 100;
  if (totalCm >= 40) return 95;
  if (totalCm >= 30) return 85;
  if (totalCm >= 20) return 70;
  if (totalCm >= 15) return 60;
  if (totalCm >= 10) return 50;
  if (totalCm >= 5) return 35;
  if (totalCm >= 2) return 20;
  if (totalCm > 0) return 10;
  return 5;
}

/**
 * Score enneigement estimé (0-100)
 * En Phase 1, on estime via le cumul neige 7j + altitude.
 * Sera remplacé par les données réelles (scraping) en Phase 4.
 */
function scoreSnowpack(
  dailyForecasts: DailyForecast[],
  station: Station
): number {
  // Cumul neige sur les 7 jours
  const totalSnow7d = dailyForecasts.reduce((sum, d) => sum + d.snowfallCm, 0);

  // Bonus altitude : plus c'est haut, plus on suppose un bon manteau
  const altitudeBonus = Math.min(
    30,
    Math.max(0, (station.altitudeMax - 1500) / 50)
  );

  // Estimation grossière : cumul récent + bonus altitude
  const estimatedPack = totalSnow7d * 2.5 + altitudeBonus;

  if (estimatedPack >= 100) return 100;
  if (estimatedPack >= 80) return 85;
  if (estimatedPack >= 60) return 70;
  if (estimatedPack >= 40) return 55;
  if (estimatedPack >= 25) return 40;
  if (estimatedPack >= 10) return 25;
  return 10;
}

/**
 * Score météo journalier (0-100)
 * Combine le code météo + la température
 */
function scoreDailyWeather(forecast: DailyForecast): number {
  const { category } = getWeatherDescription(forecast.weatherCode);

  // Score code météo (0-70)
  let weatherScore: number;
  switch (category) {
    case "clear":
      weatherScore = 70;
      break;
    case "cloudy":
      weatherScore = 45;
      break;
    case "fog":
      weatherScore = 25;
      break;
    case "snow":
      weatherScore = 55; // La neige c'est bien pour le ski !
      break;
    case "rain":
      weatherScore = 5;
      break;
    case "thunderstorm":
      weatherScore = 0;
      break;
    default:
      weatherScore = 30;
  }

  // Score température (0-30)
  // Idéal pour le ski : entre -12°C et -3°C
  const avgTemp =
    (forecast.temperatureMaxC + forecast.temperatureMinC) / 2;

  let tempScore: number;
  if (avgTemp >= -12 && avgTemp <= -3) {
    tempScore = 30; // Idéal : neige froide, bonne glisse
  } else if (avgTemp >= -15 && avgTemp < -12) {
    tempScore = 25; // Un peu froid
  } else if (avgTemp > -3 && avgTemp <= 0) {
    tempScore = 22; // Correct, neige transformée
  } else if (avgTemp > 0 && avgTemp <= 3) {
    tempScore = 12; // Fonte en cours
  } else if (avgTemp > 3) {
    tempScore = 5; // Trop chaud, neige lourde/pluie
  } else {
    tempScore = 15; // Très froid (<-15)
  }

  return Math.min(100, weatherScore + tempScore);
}

/**
 * Score météo sur la semaine (0-100)
 * Moyenne pondérée des 3 meilleurs jours
 */
function scoreWeekWeather(dailyForecasts: DailyForecast[]): number {
  const dailyScores = dailyForecasts
    .map((d) => scoreDailyWeather(d))
    .sort((a, b) => b - a); // Tri décroissant

  // Les 3 meilleurs jours avec pondération dégressive
  const weights = [1.0, 0.9, 0.8];
  let weightedSum = 0;
  let weightTotal = 0;

  for (let i = 0; i < Math.min(3, dailyScores.length); i++) {
    weightedSum += dailyScores[i] * weights[i];
    weightTotal += weights[i];
  }

  return weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
}

/**
 * Score vent (0-100) — moyenne sur la semaine
 */
function scoreWind(dailyForecasts: DailyForecast[]): number {
  const avgWind =
    dailyForecasts.reduce((sum, d) => sum + d.windSpeedMaxKmh, 0) /
    dailyForecasts.length;

  if (avgWind < 15) return 100;
  if (avgWind < 25) return 85;
  if (avgWind < 35) return 65;
  if (avgWind < 45) return 45;
  if (avgWind < 55) return 25;
  if (avgWind < 65) return 10;
  return 0;
}

/**
 * Score ouverture estimé (0-100)
 * En Phase 1, on estime via la période + altitude.
 * Sera remplacé par les données réelles (scraping) en Phase 4.
 */
function scoreOpening(station: Station): number {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // Haute saison : décembre (11) à mars (2) → score élevé
  const isHighSeason = month >= 11 || month <= 2;
  // Saison intermédiaire : novembre (10), avril (3)
  const isMidSeason = month === 10 || month === 3;

  if (isHighSeason) {
    // En haute saison, les grosses stations sont quasi full
    if (station.kmPistes >= 200) return 95;
    if (station.kmPistes >= 100) return 85;
    if (station.kmPistes >= 50) return 75;
    return 65;
  }

  if (isMidSeason) {
    // Saison intermédiaire, dépend de l'altitude
    if (station.altitudeMax >= 3000) return 80;
    if (station.altitudeMax >= 2500) return 60;
    if (station.altitudeMax >= 2000) return 40;
    return 20;
  }

  // Hors saison
  if (station.altitudeMax >= 3000) return 40; // Glaciers
  return 5;
}

// ──────── SCORES PAR JOUR (pour l'affichage détaillé) ────────

function computeDailyScores(
  dailyForecasts: DailyForecast[],
  station: Station
): DailyScore[] {
  return dailyForecasts.map((forecast) => {
    const snowScore = forecast.snowfallCm >= 10
      ? 100
      : forecast.snowfallCm >= 5
        ? 70
        : forecast.snowfallCm >= 1
          ? 40
          : forecast.snowfallCm > 0
            ? 20
            : 5;

    const weatherDayScore = scoreDailyWeather(forecast);

    let windDayScore: number;
    if (forecast.windSpeedMaxKmh < 20) windDayScore = 100;
    else if (forecast.windSpeedMaxKmh < 35) windDayScore = 70;
    else if (forecast.windSpeedMaxKmh < 50) windDayScore = 35;
    else windDayScore = 0;

    const dayTotal = Math.round(
      snowScore * 0.35 +
      weatherDayScore * 0.35 +
      windDayScore * 0.30
    );

    return {
      date: forecast.date,
      score: dayTotal,
      snowScore,
      weatherScore: weatherDayScore,
      windScore: windDayScore,
    };
  });
}

// ──────── TAGS AUTOMATIQUES ────────

function computeTags(
  dailyForecasts: DailyForecast[],
  breakdown: ScoreBreakdown
): StationTag[] {
  const tags: StationTag[] = [];

  const totalSnow3d = dailyForecasts
    .slice(0, 3)
    .reduce((sum, d) => sum + d.snowfallCm, 0);
  const avgTemp =
    dailyForecasts.reduce(
      (sum, d) => sum + (d.temperatureMaxC + d.temperatureMinC) / 2,
      0
    ) / dailyForecasts.length;
  const avgWind =
    dailyForecasts.reduce((sum, d) => sum + d.windSpeedMaxKmh, 0) /
    dailyForecasts.length;
  const clearDays = dailyForecasts.filter((d) =>
    isClearCode(d.weatherCode)
  ).length;
  const snowDays = dailyForecasts.filter((d) =>
    isSnowCode(d.weatherCode)
  ).length;
  const rainDays = dailyForecasts.filter((d) => {
    const { category } = getWeatherDescription(d.weatherCode);
    return category === "rain";
  }).length;

  // 🥇 JACKPOT POUDREUSE : >30cm neige fraîche + froid + vent calme
  if (totalSnow3d >= 30 && avgTemp < -2 && avgWind < 35) {
    tags.push({
      id: "jackpot",
      label: "JACKPOT POUDREUSE",
      emoji: "🥇",
      color: "bg-yellow-500",
      priority: 1,
    });
  }

  // ❄️ GROSSE NEIGE : >20cm mais conditions moins parfaites
  if (totalSnow3d >= 20 && !tags.some((t) => t.id === "jackpot")) {
    tags.push({
      id: "big-snow",
      label: "GROSSE NEIGE",
      emoji: "❄️",
      color: "bg-blue-500",
      priority: 2,
    });
  }

  // ☀️ GRAND BEAU : majorité de jours dégagés + vent faible
  if (clearDays >= 4 && avgWind < 30) {
    tags.push({
      id: "grand-beau",
      label: "GRAND BEAU",
      emoji: "☀️",
      color: "bg-amber-400",
      priority: 3,
    });
  }

  // 🌨️ NEIGE EN VUE : chutes à venir
  if (snowDays >= 3 && totalSnow3d >= 10) {
    tags.push({
      id: "snow-coming",
      label: "NEIGE EN VUE",
      emoji: "🌨️",
      color: "bg-cyan-400",
      priority: 4,
    });
  }

  // ⚠️ PLUIE EN BAS : risque de pluie
  if (rainDays >= 2) {
    tags.push({
      id: "rain-risk",
      label: "PLUIE EN BAS",
      emoji: "⚠️",
      color: "bg-orange-500",
      priority: 8,
    });
  }

  // 💨 VENT FORT : risque de fermeture remontées
  if (avgWind >= 50) {
    tags.push({
      id: "windy",
      label: "VENT FORT",
      emoji: "💨",
      color: "bg-red-500",
      priority: 9,
    });
  }

  // 🟢 BON PLAN : score global correct, pas de gros défaut
  if (
    breakdown.total >= 55 &&
    breakdown.total < 75 &&
    tags.length === 0
  ) {
    tags.push({
      id: "bon-plan",
      label: "BON PLAN",
      emoji: "🟢",
      color: "bg-green-500",
      priority: 6,
    });
  }

  // 🥶 GRAND FROID : attention températures extrêmes
  if (avgTemp < -15) {
    tags.push({
      id: "cold",
      label: "GRAND FROID",
      emoji: "🥶",
      color: "bg-indigo-500",
      priority: 7,
    });
  }

  return tags.sort((a, b) => a.priority - b.priority);
}

// ──────── CALCUL SCORE GLOBAL ────────

export function computeStationScore(
  station: Station,
  weather: StationWeather
): ScoredStation {
  const { daily } = weather;

  const snowScore = scoreSnowfall(daily);
  const snowpackScore = scoreSnowpack(daily, station);
  const weatherScore = scoreWeekWeather(daily);
  const windScore = scoreWind(daily);
  const openingScore = scoreOpening(station);

  const total = Math.round(
    snowScore * WEIGHTS.snow +
    snowpackScore * WEIGHTS.snowpack +
    weatherScore * WEIGHTS.weather +
    windScore * WEIGHTS.wind +
    openingScore * WEIGHTS.opening
  );

  const breakdown: ScoreBreakdown = {
    total,
    snow: snowScore,
    snowpack: snowpackScore,
    weather: weatherScore,
    wind: windScore,
    opening: openingScore,
  };

  const dailyScores = computeDailyScores(daily, station);
  const tags = computeTags(daily, breakdown);

  return {
    station,
    weather,
    score: breakdown,
    dailyScores,
    tags,
  };
}

/**
 * Calcule et trie toutes les stations par score décroissant
 */
export function rankStations(
  stations: Station[],
  weatherMap: Map<string, StationWeather>
): ScoredStation[] {
  const scored: ScoredStation[] = [];

  for (const station of stations) {
    const weather = weatherMap.get(station.id);
    if (!weather) continue;

    scored.push(computeStationScore(station, weather));
  }

  return scored.sort((a, b) => b.score.total - a.score.total);
}

// ──────── UTILS EXPORT ────────

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 65) return "text-emerald-400";
  if (score >= 50) return "text-yellow-400";
  if (score >= 35) return "text-orange-400";
  return "text-red-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 65) return "bg-emerald-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 35) return "bg-orange-500";
  return "bg-red-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Exceptionnel";
  if (score >= 75) return "Excellent";
  if (score >= 65) return "Très bon";
  if (score >= 55) return "Bon";
  if (score >= 45) return "Correct";
  if (score >= 35) return "Moyen";
  return "Défavorable";
}
