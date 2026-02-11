interface HeroSectionProps {
  topStation: string | null;
  totalStations: number;
}

export function HeroSection({ topStation, totalStations }: HeroSectionProps) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mb-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
          <span className="gradient-text">Où skier cette semaine</span>{" "}
          <span className="text-white">?</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          Classement intelligent de{" "}
          <span className="font-semibold text-white">{totalStations}</span>{" "}
          stations basé sur les prévisions neige, météo, vent et enneigement.
        </p>
        <p className="mt-2 text-sm text-slate-500">{today}</p>
        {topStation && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-glacier-500/30 bg-glacier-500/10 px-5 py-2.5">
            <span className="text-lg">🥇</span>
            <span className="text-sm text-slate-300">
              Top station :{" "}
              <span className="font-bold text-glacier-400">{topStation}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
