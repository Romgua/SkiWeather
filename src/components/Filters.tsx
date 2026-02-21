"use client";

import { useState, useCallback } from "react";

interface FiltersProps {
    massifs: string[];
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    massif: string | null;
    minAltitude: number | null;
    minScore: number | null;
}

const altitudeOptions = [
    { label: "Toutes", value: null },
    { label: "2000m+", value: 2000 },
    { label: "2500m+", value: 2500 },
    { label: "3000m+", value: 3000 },
];

export function Filters({ massifs, onFilterChange }: FiltersProps) {
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        massif: null,
        minAltitude: null,
        minScore: null,
    });

    const updateFilter = useCallback(
        (key: keyof FilterState, value: string | number | null) => {
            const newFilters = { ...activeFilters, [key]: value };
            setActiveFilters(newFilters);
            onFilterChange(newFilters);
        },
        [activeFilters, onFilterChange]
    );

    const hasActiveFilters = Object.values(activeFilters).some((v) => v !== null);

    return (
        <div className="glass-card p-4">
            <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-snow-300/50">
          Filtres
        </span>

                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => updateFilter("massif", null)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            activeFilters.massif === null
                                ? "bg-glacier-500/20 text-glacier-400 ring-1 ring-glacier-500/30"
                                : "bg-white/5 text-snow-300/60 hover:bg-white/10"
                        }`}
                    >
                        Tous
                    </button>
                    {massifs.map((m) => (
                        <button
                            key={m}
                            onClick={() =>
                                updateFilter("massif", activeFilters.massif === m ? null : m)
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                activeFilters.massif === m
                                    ? "bg-glacier-500/20 text-glacier-400 ring-1 ring-glacier-500/30"
                                    : "bg-white/5 text-snow-300/60 hover:bg-white/10"
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <div className="flex gap-1.5">
                    {altitudeOptions.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => updateFilter("minAltitude", opt.value)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                activeFilters.minAltitude === opt.value
                                    ? "bg-glacier-500/20 text-glacier-400 ring-1 ring-glacier-500/30"
                                    : "bg-white/5 text-snow-300/60 hover:bg-white/10"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {hasActiveFilters && (
                    <>
                        <div className="h-4 w-px bg-white/10" />
                        <button
                            onClick={() => {
                                const reset: FilterState = {
                                    massif: null,
                                    minAltitude: null,
                                    minScore: null,
                                };
                                setActiveFilters(reset);
                                onFilterChange(reset);
                            }}
                            className="rounded-full px-3 py-1.5 text-xs font-medium text-red-400/80 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                        >
                            ✕ Reset
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
