// ============================================================
// TYPES — SkiWeather
// ============================================================

export type Massif =
  | "Mont-Blanc"
  | "Tarentaise"
  | "Vanoise"
  | "Beaufortain"
  | "Aravis"
  | "Chablais"
  | "Giffre"
  | "Belledonne"
  | "Grandes Rousses"
  | "Oisans"
  | "Serre Chevalier"
  | "Écrins"
  | "Queyras"
  | "Ubaye" 
  | "Maurienne"
  | "Mercantour"
  | "Vercors"
  | "Chartreuse"
  | "Dévoluy"
  | "Pyrénées Centrales"
  | "Pyrénées Orientales"
  | "Pyrénées Atlantiques"
  | "Jura"
  | "Vosges"
  | "Massif Central";

export type Region =
  | "Auvergne-Rhône-Alpes"
  | "Provence-Alpes-Côte d'Azur"
  | "Occitanie"
  | "Nouvelle-Aquitaine"
  | "Bourgogne-Franche-Comté"
  | "Grand Est";

export interface Station {
  id: string;
  name: string;
  slug: string;
  massif: Massif;
  region: Region;
  lat: number;
  lon: number;
  altitudeVillage: number;
  altitudeMin: number;
  altitudeMax: number;
  kmPistes: number;
  openMeteoElevation: number;
    snowForecastSlug: string | null;
    skiinfoSlug: string | null;
}

export interface DailyForecast {
  date: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  weatherCode: number;
  snowfallCm: number;
  precipitationMm: number;
  windSpeedMaxKmh: number;
  windGustsMaxKmh: number;
  precipitationProbability: number;
  sunshineDurationH: number;
}

export interface StationWeather {
  stationId: string;
  fetchedAt: string;
  daily: DailyForecast[];
  elevation: number;
}

export type WeatherCategory =
  | "clear"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "thunderstorm";

export interface WeatherDescription {
  label: string;
  icon: string;
  category: WeatherCategory;
}

export interface ScoreBreakdown {
  total: number;
  snow: number;
  snowpack: number;
  weather: number;
  wind: number;
  opening: number;
}

export interface DailyScore {
  date: string;
  score: number;
  snowScore: number;
  weatherScore: number;
  windScore: number;
}

export interface StationTag {
  id: string;
  label: string;
  emoji: string;
  color: string;
  priority: number;
}

export interface ScoredStation {
  station: Station;
  weather: StationWeather;
  score: ScoreBreakdown;
  dailyScores: DailyScore[];
  tags: StationTag[];
}

export interface FilterOptions {
  massif: string | null;
  region: string | null;
  minAltitude: number | null;
  minScore: number | null;
}

export interface SnowForecastData {
    snowDepthHighCm: number;
    snowDepthLowCm: number;
    freshSnow3dCm: number;
    freshSnow7dCm: number;
    scrapedAt: string; // ISO date
}

export interface SkiinfoData {
    openLifts: number;
    totalLifts: number;
    openSlopes: number;  // km
    totalSlopes: number; // km
    isOpen: boolean;
    scrapedAt: string;
}

export interface ScrapedStationData {
    stationId: string;
    snowForecast: SnowForecastData | null;
    skiinfo: SkiinfoData | null;
}