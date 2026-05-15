export function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 text-xs text-slate-400">
                    <p>
                        Données :{" "}
                        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">Open-Meteo</a>
                        {" · "}
                        <a href="https://www.snow-forecast.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">Snow-Forecast</a>
                        {" · "}
                        <a href="https://www.skiinfo.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">Skiinfo</a>
                    </p>
                    <p className="text-center">Données indicatives — bulletins officiels à consulter</p>
                    <p className="sm:text-right">
                        © 2026{" "}
                        <a href="https://romainguarnotta.fr" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                            Romain Guarnotta
                        </a>
                        {" "}· All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
