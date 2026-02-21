export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-peak-950/60">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-snow-300/60">
                            Données :{" "}
                            <a
                                href="https://open-meteo.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-glacier-400/80 hover:text-glacier-400 transition-colors"
                            >
                                Open-Meteo
                            </a>
                            {" • "}
                            <a
                                href="https://www.snow-forecast.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-glacier-400/80 hover:text-glacier-400 transition-colors"
                            >
                                Snow-Forecast
                            </a>
                            {" • "}
                            <a
                                href="https://www.skiinfo.fr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-glacier-400/80 hover:text-glacier-400 transition-colors"
                            >
                                Skiinfo
                            </a>
                        </p>
                    </div>
                    <p className="text-xs text-snow-300/40">
                        Informations indicatives — consultez les bulletins officiels avant
                        de skier
                    </p>
                </div>
            </div>
        </footer>
    );
}
