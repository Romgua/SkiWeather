"use client";

import { useState, useMemo, useCallback } from "react";
import type { ScoredStation } from "@/lib/types";
import { StationCard } from "./StationCard";
import { Filters, type FilterState } from "./Filters";
import { DateSelector } from "./DateSelector";
import { RecommendationBanner } from "./RecommendationBanner";
import { CompareBar } from "./CompareBar";

interface StationListProps {
    stations: ScoredStation[];
}

export function StationList({ stations }: StationListProps) {
    const [selectedDay, setSelectedDay] = useState(0);
    const [compareList, setCompareList] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        massif: null,
        minAltitude: null,
        minScore: null,
    });
    const [showAll, setShowAll] = useState(false);

    const availableDays = stations[0]?.weather.daily.length ?? 7;

    const massifs = useMemo(() => {
        const set = new Set(stations.map((s) => s.station.massif));
        return Array.from(set).sort();
    }, [stations]);

    // Re-trier par score du jour sélectionné + filtrer
    const filtered = useMemo(() => {
        return stations
            .filter((s) => {
                if (filters.massif && s.station.massif !== filters.massif) return false;
                if (filters.minAltitude && s.station.altitudeMax < filters.minAltitude) return false;
                if (filters.minScore && s.score.total < filters.minScore) return false;
                return true;
            })
            .sort((a, b) => {
                const sa = a.dailyScores[selectedDay]?.score ?? a.score.total;
                const sb = b.dailyScores[selectedDay]?.score ?? b.score.total;
                return sb - sa;
            });
    }, [stations, filters, selectedDay]);

    const displayed = showAll ? filtered : filtered.slice(0, 15);

    const onFilterChange = useCallback((f: FilterState) => {
        setFilters(f);
        setShowAll(false);
    }, []);

    const handleCompareToggle = useCallback((slug: string) => {
        setCompareList((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug].slice(0, 3)
        );
    }, []);

    const compareStations = useMemo(
        () => compareList.map((slug) => stations.find((s) => s.station.slug === slug)!).filter(Boolean),
        [compareList, stations]
    );

    return (
        <div className="space-y-4 pb-24">
            {/* Sélecteur de date */}
            <DateSelector
                selectedDay={selectedDay}
                onSelectDay={(day) => { setSelectedDay(day); setShowAll(false); }}
                availableDays={availableDays}
            />

            {/* Bandeau recommandation */}
            <RecommendationBanner stations={stations} selectedDay={selectedDay} />

            {/* Filtres */}
            <Filters massifs={massifs} onFilterChange={onFilterChange} />

            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    {filtered.length} station{filtered.length > 1 ? "s" : ""}
                    {filters.massif ? ` · ${filters.massif}` : ""}
                </p>
                {compareList.length > 0 && (
                    <p className="text-xs text-blue-600 font-medium">
                        {compareList.length} sélectionné{compareList.length > 1 ? "s" : ""} pour comparaison
                    </p>
                )}
            </div>

            {/* Liste */}
            <div className="space-y-2.5">
                {displayed.map((scored, i) => (
                    <StationCard
                        key={scored.station.id}
                        station={scored}
                        rank={i + 1}
                        dayIndex={selectedDay}
                        isComparing={compareList.includes(scored.station.slug)}
                        canAddToCompare={compareList.length < 3}
                        onCompareToggle={handleCompareToggle}
                    />
                ))}
            </div>

            {!showAll && filtered.length > 15 && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setShowAll(true)}
                        className="rounded-xl px-6 py-3 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                    >
                        Voir les {filtered.length - 15} stations restantes
                    </button>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="card p-12 text-center">
                    <p className="text-4xl mb-3">🏔️</p>
                    <p className="text-slate-500">Aucune station ne correspond aux filtres sélectionnés</p>
                </div>
            )}

            {/* Barre de comparaison flottante */}
            <CompareBar
                selected={compareStations}
                onRemove={(slug) => setCompareList((prev) => prev.filter((s) => s !== slug))}
                onClear={() => setCompareList([])}
            />
        </div>
    );
}
