"use client";

import { useState, useMemo, useCallback } from "react";
import type { ScoredStation } from "@/lib/types";
import { StationCard } from "./StationCard";
import { Filters, type FilterState } from "./Filters";

interface StationListProps {
    stations: ScoredStation[];
}

export function StationList({ stations }: StationListProps) {
    const [filters, setFilters] = useState<FilterState>({
        massif: null,
        minAltitude: null,
        minScore: null,
    });

    const [showAll, setShowAll] = useState(false);

    const massifs = useMemo(() => {
        const set = new Set(stations.map((s) => s.station.massif));
        return Array.from(set).sort();
    }, [stations]);

    const filtered = useMemo(() => {
        return stations.filter((s) => {
            if (filters.massif && s.station.massif !== filters.massif) return false;
            if (filters.minAltitude && s.station.altitudeMax < filters.minAltitude)
                return false;
            if (filters.minScore && s.score.total < filters.minScore) return false;
            return true;
        });
    }, [stations, filters]);

    const displayed = showAll ? filtered : filtered.slice(0, 15);

    const onFilterChange = useCallback((f: FilterState) => {
        setFilters(f);
        setShowAll(false);
    }, []);

    return (
        <div className="space-y-4">
            <Filters massifs={massifs} onFilterChange={onFilterChange} />

            <div className="flex items-center justify-between">
                <p className="text-sm text-snow-300/50">
                    {filtered.length} station{filtered.length > 1 ? "s" : ""}
                    {filters.massif ? ` · ${filters.massif}` : ""}
                </p>
            </div>

            <div className="space-y-3">
                {displayed.map((scored, i) => (
                    <StationCard key={scored.station.id} station={scored} rank={i + 1} />
                ))}
            </div>

            {!showAll && filtered.length > 15 && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setShowAll(true)}
                        className="rounded-xl px-6 py-3 text-sm font-medium bg-glacier-500/10 text-glacier-400 hover:bg-glacier-500/20 transition-all ring-1 ring-glacier-500/20"
                    >
                        Voir les {filtered.length - 15} stations restantes
                    </button>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <p className="text-4xl mb-3">🏔️</p>
                    <p className="text-snow-300/60">
                        Aucune station ne correspond aux filtres sélectionnés
                    </p>
                </div>
            )}
        </div>
    );
}
