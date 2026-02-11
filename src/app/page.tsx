import { getScoredStations } from "@/lib/data-service";
import { HeroSection } from "@/components/HeroSection";
import { QuickStats } from "@/components/QuickStats";
import { StationList } from "@/components/StationList";
import type { ScoredStation } from "@/lib/types";

export const revalidate = 10800;

export default async function HomePage() {
    let stations: ScoredStation[] = [];
    let error: string | null = null;

    try {
        stations = await getScoredStations();
    } catch (e) {
        console.error("[SkiWeather] Failed to load stations:", e);
        error =
            e instanceof Error
                ? e.message
                : "Impossible de charger les données météo.";
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <span className="text-5xl">❄️</span>
                <h2 className="mt-4 text-xl font-bold text-white">
                    Données temporairement indisponibles
                </h2>
                <p className="mt-2 text-sm text-slate-400">{error}</p>
                <p className="mt-1 text-xs text-slate-500">
                    Réessayez dans quelques minutes.
                </p>
            </div>
        );
    }

    if (stations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <span className="text-5xl">🏔️</span>
                <h2 className="mt-4 text-xl font-bold text-white">
                    Aucune station disponible
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    Les données météo sont en cours de chargement.
                </p>
            </div>
        );
    }

    return (
        <>
            <HeroSection
                topStation={stations[0].station.name}
                totalStations={stations.length}
            />
            <QuickStats stations={stations} />
            <StationList stations={stations} />
        </>
    );
}
