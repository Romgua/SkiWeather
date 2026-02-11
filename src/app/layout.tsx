import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkiWeather — Où skier cette semaine ?",
  description:
    "Classement intelligent des stations de ski françaises basé sur les conditions météo, enneigement et vent. Trouvez la meilleure station pour skier ce week-end.",
  keywords: [
    "ski",
    "météo ski",
    "neige",
    "station de ski",
    "enneigement",
    "où skier",
    "prévisions neige",
    "alpes",
    "pyrénées",
  ],
  openGraph: {
    title: "SkiWeather — Où skier cette semaine ?",
    description:
      "Classement intelligent des stations de ski basé sur la météo en temps réel.",
    type: "website",
    locale: "fr_FR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎿</span>
          <span className="text-lg font-bold">
            <span className="gradient-text">Ski</span>
            <span className="text-white">Weather</span>
          </span>
        </a>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="hidden sm:inline">
            🏔️ 50 stations • Alpes & Pyrénées
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500">
        <p>
          SkiWeather — Données météo{" "}
          <a
            href="https://open-meteo.com"
            className="underline hover:text-slate-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>{" "}
          (licence CC BY 4.0)
        </p>
        <p className="mt-1">
          Pas de cookies, pas de tracking. 100% open source.
        </p>
        <p className="mt-1 text-slate-600">
          Les conditions réelles peuvent varier. Consultez toujours le BRA
          avant de skier hors-piste.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
