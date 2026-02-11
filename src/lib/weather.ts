import type { Station, StationWeather, DailyForecast } from "./types";

// ============================================================
// OPEN-METEO API CLIENT
// Gratuit, sans clé, fiable. On requête les prévisions 7 jours
// à l'altitude du domaine skiable (pas du village).
// ============================================================

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Paramètres demandés à Open-Meteo
const DAILY_PARAMS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "weathercode",
  "snowfall_sum",
  "precipitation_sum",
  "precipitation_probability_max",
  "windspeed_10m_max",
  "windgusts_10m_max",
  "sunshine_duration",
].join(",");

interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    snowfall_sum: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    windspeed_10m_max: number[];
    windgusts_10m_max: number[];
    sunshine_duration: number[];
  };
  elevation: number;
}

/**
 * Récupère les prévisions 7 jours pour une station
 * à l'altitude du domaine skiable.
 */
export async function fetchStationWeather(
  station: Station
): Promise<StationWeather> {
  const url = new URL(BASE_URL);
  url.searchParams.set("latitude", station.lat.toString());
  url.searchParams.set("longitude", station.lon.toString());
  url.searchParams.set("daily", DAILY_PARAMS);
  url.searchParams.set("timezone", "Europe/Paris");
  url.searchParams.set("forecast_days", "7");
  // Forcer l'altitude pour avoir la météo en haut du domaine
  url.searchParams.set("elevation", station.openMeteoElevation.toString());

  const response = await fetch(url.toString(), {
    next: { revalidate: 10800 }, // Cache 3h côté Next.js
  });

  if (!response.ok) {
    throw new Error(
      `Open-Meteo error for ${station.name}: ${response.status} ${response.statusText}`
    );
  }

  const data: OpenMeteoDailyResponse = await response.json();

  const daily: DailyForecast[] = data.daily.time.map((date, i) => ({
    date,
    temperatureMaxC: data.daily.temperature_2m_max[i],
    temperatureMinC: data.daily.temperature_2m_min[i],
    weatherCode: data.daily.weathercode[i],
    snowfallCm: data.daily.snowfall_sum[i],
    precipitationMm: data.daily.precipitation_sum[i],
    windSpeedMaxKmh: data.daily.windspeed_10m_max[i],
    windGustsMaxKmh: data.daily.windgusts_10m_max[i],
    precipitationProbability: data.daily.precipitation_probability_max[i],
    sunshineDurationH: data.daily.sunshine_duration[i] / 3600, // secondes → heures
  }));

  return {
    stationId: station.id,
    fetchedAt: new Date().toISOString(),
    daily,
    elevation: data.elevation,
  };
}

/**
 * Récupère la météo de toutes les stations en parallèle
 * avec un système de batch pour respecter les rate limits.
 */
export async function fetchAllStationsWeather(
  stations: Station[]
): Promise<Map<string, StationWeather>> {
  const results = new Map<string, StationWeather>();
  const BATCH_SIZE = 10;

  for (let i = 0; i < stations.length; i += BATCH_SIZE) {
    const batch = stations.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map((station) => fetchStationWeather(station))
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.set(result.value.stationId, result.value);
      } else {
        console.error("Failed to fetch weather:", result.reason);
      }
    }

    // Pause entre les batchs pour respecter le rate limit
    if (i + BATCH_SIZE < stations.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
