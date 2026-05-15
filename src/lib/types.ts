// ============================================================
// TYPES — OùSkier
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
  massif: string;
  region: string;
  lat: number;
  lon: number;
  altitudeVillage: number;
  altitudeMin: number;
  altitudeMax: number;
  kmPistes: number;
  openMeteoElevation: number;
  snowForecastSlug: string | null;
  skiinfoSlug: string | null;
  skiinfoRegion: string | null;
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
  snowForecast: SnowForecastData | null;
  skiinfo: SkiinfoData | null;
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
    stationId: string;
    // Enneigement
    snowBase: number;       // cm en bas
    snowMid: number;        // cm moyenne montagne
    snowTop: number;        // cm en haut
    snowQuality: string;    // "Poudreuse", "Damée", etc.
    // Neige fraîche (historique récent)
    recentSnowDays: number[];  // derniers jours (le plus ancien en premier)
    recentSnowTotal: number;   // somme
    // Prévisions neige
    forecastSnowDays: number[]; // prochains jours
    forecastSnowTotal: number;
    // Remontées & pistes
    liftsOpen: number;
    liftsTotal: number;
    runsOpen: number;
    runsTotal: number;
    // Statut
    isOpen: boolean;
    // Méta
    scrapedAt: string;
}

export interface ScrapedStationData {
    stationId: string;
    snowForecast: SnowForecastData | null;
    skiinfo: SkiinfoData | null;
}