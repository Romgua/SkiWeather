import type {
    Station,
    StationWeather,
    DailyForecast,
    ScoreBreakdown,
    DailyScore,
    StationTag,
    ScoredStation, SnowForecastData, SkiinfoData
} from "./types";
import {getWeatherDescription, isClearCode, isSnowCode} from "./weather-codes";

// ============================================================
// ALGORITHME DE SCORING
// Score 0-100 par station, basé sur 5 critères pondérés
// ============================================================

// --- Helpers de clamp ---
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function lerp(value: number, inMin: number, inMax: number): number {
    if (inMax === inMin) return 0;
    return clamp(((value - inMin) / (inMax - inMin)) * 100, 0, 100);
}

// ============================================================
// 1. Score Neige Fraîche (30%)
// Cumul neige sur les 3 prochains jours
// >40cm = 100 | 30cm = 85 | 20cm = 70 | 10cm = 50 | 0cm = 5
// ============================================================
function scoreSnowfall(daily: DailyForecast[]): number {
    const snow3j = daily.slice(0, 3).reduce((sum, d) => sum + d.snowfallCm, 0);

    if (snow3j >= 40) return 100;
    if (snow3j >= 30) return 85;
    if (snow3j >= 20) return 70;
    if (snow3j >= 10) return 50;
    if (snow3j >= 5) return 30;
    if (snow3j > 0) return 15;
    return 5;
}

// ============================================================
// 2. Score Enneigement (25%)
// Basé sur snow_depth Open-Meteo (estimation)
// En Phase 4, sera enrichi par scraping Snow-Forecast
// Haut (60%) + Bas (40%)
// >200cm = 100 | 150 = 80 | 100 = 60 | 50 = 35 | <30 = 10
// ============================================================
function scoreSnowpack(d:DailyForecast[],st:Station,snowForecast?:SnowForecastData|null):number{
    // Données réelles si disponibles
    if(snowForecast&&(snowForecast.snowDepthHighCm>0||snowForecast.snowDepthLowCm>0)){
        const high=snowDepthToScore(snowForecast.snowDepthHighCm);
        const low=snowDepthToScore(snowForecast.snowDepthLowCm);
        return Math.round(high*0.6+low*0.4)
    }
    // Fallback estimation
    const total=d.reduce((s,x)=>s+x.snowfallCm,0);
    const month=new Date().getMonth();
    const baseMap:Record<number,number>={0:120,1:150,2:130,3:80,4:30,5:0,6:0,7:0,8:0,9:0,10:20,11:60};
    const base=(baseMap[month]??0)*Math.max(0.3,st.altitudeMax/2000);
    const altF=Math.min(1.5,Math.max(0.5,st.altitudeMax/2000));
    const estH=base+total*altF;
    const altR=Math.max(0.2,st.altitudeMin/st.altitudeMax);
    const estL=estH*altR;
    const high=snowDepthToScore(estH),low=snowDepthToScore(estL);
    return Math.round(high*0.6+low*0.4)
}

function snowDepthToScore(depthCm: number): number {
    if (depthCm >= 200) return 100;
    if (depthCm >= 150) return 80;
    if (depthCm >= 100) return 60;
    if (depthCm >= 50) return 35;
    if (depthCm >= 30) return 20;
    return 10;
}

// ============================================================
// 3. Score Météo (25%)
// Soleil = 100 | Couvert = 50 | Pluie = 0
// + bonus/malus température : -5/-12°C = 100 | >3°C = 10
// ============================================================
function scoreWeather(daily: DailyForecast[]): number {
    const best3 = daily
        .slice(0, 5)
        .map((d) => scoreSingleDayWeather(d))
        .sort((a, b) => b - a)
        .slice(0, 3);

    // Moyenne pondérée des 3 meilleurs jours
    const weights = [1.0, 0.9, 0.8];
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    const weighted = best3.reduce((sum, s, i) => sum + s * weights[i], 0);

    return Math.round(weighted / totalWeight);
}

function scoreSingleDayWeather(day: DailyForecast): number {
    const desc = getWeatherDescription(day.weatherCode);

    // Score ciel
    let skyScore: number;
    switch (desc.category) {
        case "clear":
            skyScore = 100;
            break;
        case "cloudy":
            skyScore = 55;
            break;
        case "fog":
            skyScore = 30;
            break;
        case "snow":
            skyScore = 60; // Neige = pas terrible pour la visibilité mais bon pour le ski
            break;
        case "rain":
            skyScore = 5;
            break;
        case "thunderstorm":
            skyScore = 0;
            break;
        default:
            skyScore = 40;
    }

    // Score température (moyenne du jour)
    const avgTemp = (day.temperatureMaxC + day.temperatureMinC) / 2;
    let tempScore: number;
    if (avgTemp >= 3) tempScore = 10; // Trop chaud, neige collante
    else if (avgTemp >= 0) tempScore = 50;
    else if (avgTemp >= -5) tempScore = 90;
    else if (avgTemp >= -12) tempScore = 100;
    else tempScore = 70; // Trop froid

    return Math.round(skyScore * 0.65 + tempScore * 0.35);
}

// ============================================================
// 4. Score Vent (10%)
// <20km/h = 100 | 20-40 = 65 | 40-60 = 35 | >60 = 0
// ============================================================
function scoreWind(daily: DailyForecast[]): number {
    // Moyenne du vent max sur les 3 meilleurs jours
    const winds = daily
        .slice(0, 5)
        .map((d) => d.windSpeedMaxKmh)
        .sort((a, b) => a - b)
        .slice(0, 3);

    const avgWind = winds.reduce((s, w) => s + w, 0) / winds.length;

    if (avgWind < 20) return 100;
    if (avgWind < 30) return 80;
    if (avgWind < 40) return 65;
    if (avgWind < 50) return 45;
    if (avgWind < 60) return 35;
    if (avgWind < 80) return 15;
    return 0;
}

// ============================================================
// 5. Score Ouverture (10%)
// Estimation basée sur les conditions météo
// En Phase 4, sera remplacé par données réelles Skiinfo
// ============================================================
function scoreOpening(d:DailyForecast[],st:Station,skiinfo?:SkiinfoData|null):number{
    // Données réelles si disponibles
    if(skiinfo&&skiinfo.liftsTotal>0){
        return Math.round((skiinfo.liftsOpen/skiinfo.liftsTotal)*100)
    }
    // Fallback estimation
    const avgDepth=d.reduce((s,x)=>s+x.snowfallCm,0)/d.length;
    const maxWind=Math.max(...d.slice(0,3).map(x=>x.windSpeedMaxKmh));
    const hasRain=d.slice(0,3).some(x=>getWeatherDescription(x.weatherCode).category==="rain");
    let score=50;
    if(avgDepth>=100)score+=30;else if(avgDepth>=50)score+=20;else if(avgDepth>=20)score+=5;else score-=20;
    if(maxWind>80)score-=30;else if(maxWind>60)score-=15;
    if(hasRain)score-=10;
    if(st.altitudeMax>=3000)score+=10;else if(st.altitudeMax>=2500)score+=5;
    return clamp(Math.round(score),0,100)
}

// ============================================================
// Tags automatiques
// ============================================================
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

    const clearDays = dailyForecasts.filter((d) => isClearCode(d.weatherCode)).length;

    const snowDays = dailyForecasts.filter((d) => isSnowCode(d.weatherCode)).length;

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

    // 🟢 BON PLAN : score correct, pas de gros défaut
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

    // 🥶 GRAND FROID : températures extrêmes
    if (avgTemp < -15) {
        tags.push({
            id: "cold",
            label: "GRAND FROID",
            emoji: "🥶",
            color: "bg-indigo-500",
            priority: 7,
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

    // 🌡️ REDOUX : fonte en cours
    if (avgTemp > 5) {
        tags.push({
            id: "redoux",
            label: "REDOUX",
            emoji: "🌡️",
            color: "bg-orange-400",
            priority: 10,
        });
    }

    return tags.sort((a, b) => a.priority - b.priority);
}

// ============================================================
// Scores quotidiens (pour la page station)
// ============================================================
function computeDailyScores(daily: DailyForecast[]): DailyScore[] {
    return daily.map((d) => {
        const weatherScore = scoreSingleDayWeather(d);

        // Score vent du jour
        let windScore: number;
        if (d.windSpeedMaxKmh < 20) windScore = 100;
        else if (d.windSpeedMaxKmh < 40) windScore = 65;
        else if (d.windSpeedMaxKmh < 60) windScore = 35;
        else windScore = 0;

        // Score neige du jour
        let snowScore: number;
        if (d.snowfallCm >= 15) snowScore = 100;
        else if (d.snowfallCm >= 8) snowScore = 75;
        else if (d.snowfallCm >= 3) snowScore = 50;
        else snowScore = 20;

        const dayTotal = Math.round(
            weatherScore * 0.4 + windScore * 0.2 + snowScore * 0.4
        );

        return {
            date: d.date,
            score: clamp(dayTotal, 0, 100),
            snowScore,
            weatherScore,
            windScore,
        };
    });
}


// ============================================================
// FONCTION PRINCIPALE — Score une station complète
// ============================================================
export function scoreStation(
    station:Station,
    weather:StationWeather,
    snowForecast?:SnowForecastData|null,
    skiinfo?:SkiinfoData|null
):ScoredStation{
    const daily=weather.daily;
    const snow=scoreSnowfall(daily);
    const snowpack=scoreSnowpack(daily,station,snowForecast);
    const weatherSc=scoreWeather(daily);
    const wind=scoreWind(daily);
    const opening=scoreOpening(daily,station,skiinfo);
    const total=Math.round(snow*0.3+snowpack*0.25+weatherSc*0.25+wind*0.1+opening*0.1);
    const score:ScoreBreakdown={total:clamp(total,0,100),snow,snowpack,weather:weatherSc,wind,opening};
    const dailyScores=computeDailyScores(daily);
    const tags=computeTags(daily,score);
    return{station,weather,score,dailyScores,tags}
}

// ============================================================
// HELPERS UI — couleurs et labels basés sur le score
// ============================================================

export function getScoreColor(score: number): string {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-sky-400";
    if (score >= 40) return "text-amber-400";
    if (score >= 20) return "text-orange-400";
    return "text-red-400";
}

export function getScoreLabel(score: number): string {
    if (score >= 85) return "Exceptionnel";
    if (score >= 70) return "Excellent";
    if (score >= 55) return "Très bon";
    if (score >= 40) return "Bon";
    if (score >= 25) return "Moyen";
    return "Défavorable";
}

export function getScoreBgColor(score: number): string {
    if (score >= 80) return "bg-emerald-500/20";
    if (score >= 60) return "bg-sky-500/20";
    if (score >= 40) return "bg-amber-500/20";
    if (score >= 20) return "bg-orange-500/20";
    return "bg-red-500/20";
}

