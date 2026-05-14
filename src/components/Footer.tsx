export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                    <p className="text-sm text-slate-500">
                        Données :{" "}
                        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">Open-Meteo</a>
                        {" · "}
                        <a href="https://www.snow-forecast.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">Snow-Forecast</a>
                        {" · "}
                        <a href="https://www.skiinfo.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">Skiinfo</a>
                    </p>
                    <p className="text-xs text-slate-400">
                        Informations indicatives — consultez les bulletins officiels avant de skier
                    </p>
                </div>
            </div>
        </footer>
    );
}
