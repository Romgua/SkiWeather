import { Suspense } from "react";
import { getScoredStations } from "@/lib/data-service";
import { StationList } from "@/components/StationList";

export const revalidate = 86400;

export default async function HomePage() {
    const stations = await getScoredStations();

    const now = new Date();
    const updateTime = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
    const updateDate = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });

    const totalSnowStations = stations.filter(
        (s) => s.weather.daily.slice(0, 3).reduce((sum, d) => sum + d.snowfallCm, 0) > 5
    ).length;
    const topScore = stations[0]?.score.total ?? 0;
    const topName = stations[0]?.station.name ?? "";

    return (
        <div>
            {/* Hero — fond bleu profond */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-950 text-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                                Où skier en France ?
                            </h1>
                            <p className="text-blue-200 text-sm sm:text-base max-w-2xl">
                                Classement en temps réel de {stations.length} stations selon la neige, la météo et le vent.
                                Mis à jour le {updateDate} à {updateTime}.
                            </p>
                        </div>

                        {/* Chips stats */}
                        <div className="flex flex-wrap gap-3 shrink-0">
                            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur px-4 py-2.5">
                                <span className="text-xl">🏔️</span>
                                <div>
                                    <p className="text-lg font-bold font-mono leading-none">{stations.length}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-blue-200 mt-0.5">Stations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur px-4 py-2.5">
                                <span className="text-xl">❄️</span>
                                <div>
                                    <p className="text-lg font-bold font-mono leading-none text-sky-300">{totalSnowStations}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-blue-200 mt-0.5">Neige à venir</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur px-4 py-2.5">
                                <span className="text-xl">🏆</span>
                                <div>
                                    <p className="text-lg font-bold font-mono leading-none text-emerald-300">{topScore} <span className="text-xs font-normal text-blue-200">{topName}</span></p>
                                    <p className="text-[10px] uppercase tracking-wider text-blue-200 mt-0.5">Top score</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Suspense fallback={null}>
                    <StationList stations={stations} />
                </Suspense>
            </div>
        </div>
    );
}
