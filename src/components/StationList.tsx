"use client";

import { useState } from "react";
import type { ScoredStation } from "@/lib/types";
import { StationCard } from "./StationCard";
import { FilterBar } from "./FilterBar";

interface StationListProps {
  stations: ScoredStation[];
}

export function StationList({ stations }: StationListProps) {
  const [filtered, setFiltered] = useState<ScoredStation[]>(stations);
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? filtered : filtered.slice(0, 10);

  return (
    <div>
      {/* Filtres */}
      <div className="mb-6">
        <FilterBar stations={stations} onFilter={setFiltered} />
      </div>

      {/* Compteur résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {filtered.length} station{filtered.length > 1 ? "s" : ""}
          {filtered.length !== stations.length && (
            <span> (sur {stations.length})</span>
          )}
        </p>
        <p className="text-xs text-slate-500">
          Mis à jour :{" "}
          {new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Liste de stations */}
      {filtered.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <p className="text-lg text-slate-400">
            Aucune station ne correspond aux filtres 🏔️
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Essayez d&apos;élargir vos critères.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {displayed.map((data, index) => (
            <StationCard
              key={data.station.id}
              data={data}
              rank={index + 1}
            />
          ))}
        </div>
      )}

      {/* Bouton voir plus */}
      {!showAll && filtered.length > 10 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="rounded-xl border border-glacier-500/30 bg-glacier-500/10 px-6 py-3 text-sm font-medium text-glacier-400 transition-all hover:bg-glacier-500/20"
          >
            Voir les {filtered.length - 10} autres stations
          </button>
        </div>
      )}
    </div>
  );
}
