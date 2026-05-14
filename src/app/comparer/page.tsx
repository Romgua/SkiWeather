import { redirect } from "next/navigation";
import Link from "next/link";
import { getScoredStations } from "@/lib/data-service";
import { CompareClient } from "@/components/CompareClient";
import type { ScoredStation } from "@/lib/types";

export const revalidate = 86400;

interface ComparerPageProps {
    searchParams: Promise<{ s?: string }>;
}

export default async function ComparerPage({ searchParams }: ComparerPageProps) {
    const params = await searchParams;
    const slugs = (params.s ?? "").split(",").filter(Boolean).slice(0, 3);

    if (slugs.length < 2) redirect("/");

    const allStations = await getScoredStations();
    const selected = slugs
        .map((slug) => allStations.find((s) => s.station.slug === slug))
        .filter((s): s is ScoredStation => !!s);

    if (selected.length < 2) redirect("/");

    return (
        <div className="bg-gradient-to-br from-blue-800 to-blue-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <nav className="mb-4">
                    <Link href="/" className="text-sm text-blue-200 hover:text-white transition-colors">
                        ← Retour au classement
                    </Link>
                </nav>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Comparaison de stations</h1>
                <p className="text-blue-200 text-sm mb-6">
                    {selected.map(s => s.station.name).join(" · ")}
                </p>
            </div>
            <div className="bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    <CompareClient stations={selected} />
                </div>
            </div>
        </div>
    );
}
