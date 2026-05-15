import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./global.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    display: "swap",
});

export const metadata: Metadata = {
    title: "OùSkier — Trouve la meilleure station de ski",
    description:
        "Découvrez les meilleures conditions de ski en temps réel. Prévisions neige, enneigement, météo et scoring intelligent pour 50+ stations des Alpes et Pyrénées.",
    keywords: [
        "où skier",
        "ski",
        "météo ski",
        "enneigement",
        "conditions ski",
        "neige",
        "alpes",
        "pyrénées",
        "prévisions ski",
    ],
    openGraph: {
        title: "OùSkier — Trouve la meilleure station de ski",
        description:
            "Les meilleures conditions de ski en temps réel pour 50+ stations.",
        type: "website",
        locale: "fr_FR",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className={`${inter.variable} ${jetbrains.variable}`}>
        <body className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </body>
        </html>
    );
}
