import type { WeatherDescription, WeatherCategory } from "./types";

// ============================================================
// WMO Weather interpretation codes
// https://open-meteo.com/en/docs#weathervariables
// ============================================================

const WEATHER_CODES: Record<number, WeatherDescription> = {
  0: { label: "Ciel dégagé", icon: "☀️", category: "clear" },
  1: { label: "Peu nuageux", icon: "🌤️", category: "clear" },
  2: { label: "Partiellement nuageux", icon: "⛅", category: "cloudy" },
  3: { label: "Couvert", icon: "☁️", category: "cloudy" },
  45: { label: "Brouillard", icon: "🌫️", category: "fog" },
  48: { label: "Brouillard givrant", icon: "🌫️", category: "fog" },
  51: { label: "Bruine légère", icon: "🌦️", category: "rain" },
  53: { label: "Bruine modérée", icon: "🌦️", category: "rain" },
  55: { label: "Bruine forte", icon: "🌧️", category: "rain" },
  56: { label: "Bruine verglaçante", icon: "🌧️", category: "rain" },
  57: { label: "Bruine verglaçante forte", icon: "🌧️", category: "rain" },
  61: { label: "Pluie légère", icon: "🌦️", category: "rain" },
  63: { label: "Pluie modérée", icon: "🌧️", category: "rain" },
  65: { label: "Pluie forte", icon: "🌧️", category: "rain" },
  66: { label: "Pluie verglaçante", icon: "🌧️", category: "rain" },
  67: { label: "Pluie verglaçante forte", icon: "🌧️", category: "rain" },
  71: { label: "Neige légère", icon: "🌨️", category: "snow" },
  73: { label: "Neige modérée", icon: "❄️", category: "snow" },
  75: { label: "Neige forte", icon: "❄️", category: "snow" },
  77: { label: "Grésil", icon: "🌨️", category: "snow" },
  80: { label: "Averses légères", icon: "🌦️", category: "rain" },
  81: { label: "Averses modérées", icon: "🌧️", category: "rain" },
  82: { label: "Averses violentes", icon: "🌧️", category: "rain" },
  85: { label: "Averses de neige légères", icon: "🌨️", category: "snow" },
  86: { label: "Averses de neige fortes", icon: "❄️", category: "snow" },
  95: { label: "Orage", icon: "⛈️", category: "thunderstorm" },
  96: { label: "Orage avec grêle légère", icon: "⛈️", category: "thunderstorm" },
  99: { label: "Orage avec grêle forte", icon: "⛈️", category: "thunderstorm" },
};

const FALLBACK: WeatherDescription = {
  label: "Inconnu",
  icon: "❓",
  category: "cloudy",
};

export function getWeatherDescription(code: number): WeatherDescription {
  return WEATHER_CODES[code] ?? FALLBACK;
}

export function isSnowCode(code: number): boolean {
  return [71, 73, 75, 77, 85, 86].includes(code);
}

export function isClearCode(code: number): boolean {
  return [0, 1].includes(code);
}

export function isRainCode(code: number): boolean {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
}
