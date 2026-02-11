"use client";

import { useState, useMemo } from "react";
import type { ScoredStation, FilterOptions } from "@/lib/types";

interface FilterBarProps {
  stations: ScoredStation[];
  onFilter: (filtered: ScoredStation[]) => void;
}

export function FilterBar({ stations, onFilter }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    massif: null,
    region: null,
    minAltitude: null,
    minScore: null,
  });

  const massifs = useMemo(() => {
    const set = new Set(stations.map((s) => s.station.massif));
    return Array.from(set).sort();
  }, [stations]);

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);

    const filtered = stations.filter((s) => {
      if (
        newFilters.massif &&
        s.station.massif !== newFilters.massif
      )
        return false;
      if (
        newFilters.minAltitude &&
        s.station.altitudeMax < newFilters.minAltitude
      )
        return false;
      if (newFilters.minScore && s.score.total < newFilters.minScore)
        return false;
      return true;
    });

    onFilter(filtered);
  };

  const resetFilters = () => {
    const empty: FilterOptions = {
      massif: null,
      region: null,
      minAltitude: null,
      minScore: null,
    };
    setFilters(empty);
    onFilter(stations);
  };

  const hasActiveFilters =
    filters.massif || filters.minAltitude || filters.minScore;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Massif */}
      <select
        value={filters.massif ?? ""}
        onChange={(e) =>
          applyFilters({
            ...filters,
            massif: e.target.value || null,
          })
        }
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-glacier-500 focus:outline-none"
      >
        <option value="">Tous les massifs</option>
        {massifs.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* Altitude min */}
      <select
        value={filters.minAltitude?.toString() ?? ""}
        onChange={(e) =>
          applyFilters({
            ...filters,
            minAltitude: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-glacier-500 focus:outline-none"
      >
        <option value="">Toute altitude</option>
        <option value="2000">Sommet &gt; 2000m</option>
        <option value="2500">Sommet &gt; 2500m</option>
        <option value="3000">Sommet &gt; 3000m</option>
      </select>

      {/* Score min */}
      <select
        value={filters.minScore?.toString() ?? ""}
        onChange={(e) =>
          applyFilters({
            ...filters,
            minScore: e.target.value ? parseInt(e.target.value) : null,
          })
        }
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-glacier-500 focus:outline-none"
      >
        <option value="">Tout score</option>
        <option value="50">Score &gt; 50</option>
        <option value="65">Score &gt; 65</option>
        <option value="80">Score &gt; 80</option>
      </select>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800"
        >
          ✕ Réinitialiser
        </button>
      )}
    </div>
  );
}
