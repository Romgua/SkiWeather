"use client";

import { useRouter } from "next/navigation";
import type { ScoredStation } from "@/lib/types";

interface CompareBarProps {
    selected: ScoredStation[];
    onRemove: (slug: string) => void;
    onClear: () => void;
}

export function CompareBar({ selected, onRemove, onClear }: CompareBarProps) {
    const router = useRouter();

    if (selected.length === 0) return null;

    const canCompare = selected.length >= 2;

    function handleCompare() {
        const slugs = selected.map((s) => s.station.slug).join(",");
        router.push(`/comparer?s=${slugs}`);
    }

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">
                {/* Stations sélectionnées */}
                <div className="flex flex-1 flex-wrap gap-2 min-w-0">
                    {selected.map((s) => (
                        <div key={s.station.slug} className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
                            <span className="text-sm font-medium truncate max-w-[120px]">{s.station.name}</span>
                            <button
                                onClick={() => onRemove(s.station.slug)}
                                className="text-white/50 hover:text-white transition-colors ml-1"
                                aria-label={`Retirer ${s.station.name}`}
                            >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    {selected.length < 3 && (
                        <span className="text-xs text-white/40 self-center">
                            {3 - selected.length} station{3 - selected.length > 1 ? "s" : ""} de plus possible{3 - selected.length > 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={onClear}
                        className="text-xs text-white/50 hover:text-white/80 transition-colors px-2 py-1"
                    >
                        Effacer
                    </button>
                    <button
                        onClick={handleCompare}
                        disabled={!canCompare}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold transition-colors"
                    >
                        Comparer {selected.length > 0 ? `(${selected.length})` : ""}
                    </button>
                </div>
            </div>
        </div>
    );
}
