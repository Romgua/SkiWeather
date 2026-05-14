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
    { label: "Toutes altitudes", value: null },
    { label: "2000m et plus", value: 2000 },
    { label: "2500m et plus", value: 2500 },
    { label: "3000m et plus", value: 3000 },
];

function Select({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
                {children}
            </select>
        </div>
    );
}

export function Filters({ massifs, onFilterChange }: FiltersProps) {
    const [activeFilters, setActiveFilters] = useState<FilterState>({
        massif: null,
        minAltitude: null,
        minScore: null,
    });

    const updateFilter = useCallback(
        (key: keyof FilterState, raw: string) => {
            const value = raw === "" ? null : isNaN(Number(raw)) ? raw : Number(raw);
            const newFilters = { ...activeFilters, [key]: value };
            setActiveFilters(newFilters);
            onFilterChange(newFilters);
        },
        [activeFilters, onFilterChange]
    );

    const hasActiveFilters = Object.values(activeFilters).some((v) => v !== null);

    return (
        <div className="card p-4">
            <div className="flex flex-wrap items-end gap-4">
                <Select
                    label="Massif"
                    value={activeFilters.massif ?? ""}
                    onChange={(v) => updateFilter("massif", v)}
                >
                    <option value="">Tous les massifs</option>
                    {massifs.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </Select>

                <Select
                    label="Altitude max"
                    value={activeFilters.minAltitude?.toString() ?? ""}
                    onChange={(v) => updateFilter("minAltitude", v)}
                >
                    {altitudeOptions.map((opt) => (
                        <option key={opt.label} value={opt.value?.toString() ?? ""}>
                            {opt.label}
                        </option>
                    ))}
                </Select>

                {hasActiveFilters && (
                    <button
                        onClick={() => {
                            const reset: FilterState = { massif: null, minAltitude: null, minScore: null };
                            setActiveFilters(reset);
                            onFilterChange(reset);
                        }}
                        className="self-end rounded-xl px-4 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
                    >
                        Réinitialiser
                    </button>
                )}
            </div>
        </div>
    );
}
