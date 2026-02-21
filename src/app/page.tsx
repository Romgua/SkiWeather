import { getScoredStations } from "@/lib/data-service";
import { StationList } from "@/components/StationList";

export const revalidate = 10800;

export default async function HomePage() {
    const stations = await getScoredStations();

    const now = new Date();
    const updateTime = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Paris",
    });
    const updateDate = now.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Europe/Paris",
    });

    const totalSnowStations = stations.filter(
        (s) =>
            s.weather.daily.slice(0, 3).reduce((sum, d) => sum + d.snowfallCm, 0) > 5
    ).length;
    const topScore = stations[0]?.score.total ?? 0;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Hero */}
            <section className="mb-8 animate-fade-in">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                    <span className="gradient-text">Où skier cette semaine ?</span>
                </h1>
                <p className="text-snow-300/60 text-sm sm:text-base max-w-2xl">
                    Classement intelligent de {stations.length} stations basé sur la
                    neige fraîche, l&apos;enneigement, la météo et le vent. Mis à jour le{" "}
                    {updateDate} à {updateTime}.
                </p>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <span className="text-xl">🏔️</span>
                        <div>
                            <p className="text-lg font-bold font-mono text-snow-50">
                                {stations.length}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-snow-300/40">
                                Stations
                            </p>
                        </div>
                    </div>
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <span className="text-xl">❄️</span>
                        <div>
                            <p className="text-lg font-bold font-mono text-glacier-400">
                                {totalSnowStations}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-snow-300/40">
                                Neige à venir
                            </p>
                        </div>
                    </div>
                    <div className="glass-card px-4 py-2 flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <div>
                            <p className="text-lg font-bold font-mono text-emerald-400">
                                {topScore}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-snow-300/40">
                                Top score
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Station list */}
            <section className="animate-slide-up">
                <StationList stations={stations} />
            </section>
        </div>
    );
}
