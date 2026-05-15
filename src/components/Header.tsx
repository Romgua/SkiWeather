import Link from "next/link";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold leading-tight text-slate-900">
                            OùSkier
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                            Où skier en France
                        </span>
                    </div>
                </Link>

                <nav className="flex items-center gap-1">
                    <Link
                        href="/"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                        Classement
                    </Link>
                    <a
                        href="https://meteofrance.com/meteo-montagne"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                        BRA ↗
                    </a>
                </nav>
            </div>
        </header>
    );
}
