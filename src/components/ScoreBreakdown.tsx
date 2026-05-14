import type { ScoreBreakdown } from "@/lib/types";

interface ScoreBreakdownProps {
    breakdown: ScoreBreakdown;
}

const categories: {
    key: keyof Omit<ScoreBreakdown, "total">;
    label: string;
    emoji: string;
    weight: string;
}[] = [
    { key: "snow", label: "Neige fraîche", emoji: "❄️", weight: "30%" },
    { key: "snowpack", label: "Enneigement", emoji: "⛷️", weight: "25%" },
    { key: "weather", label: "Météo", emoji: "☀️", weight: "25%" },
    { key: "wind", label: "Vent", emoji: "💨", weight: "10%" },
    { key: "opening", label: "Ouverture", emoji: "🚡", weight: "10%" },
];

function getBarColor(score: number): string {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-400";
    return "bg-red-400";
}

export function ScoreBreakdownView({ breakdown }: ScoreBreakdownProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Détail du score
            </h3>
            <div className="space-y-3">
                {categories.map(({ key, label, emoji, weight }) => {
                    const value = breakdown[key];
                    return (
                        <div key={key} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">
                                    {emoji} {label}{" "}
                                    <span className="text-slate-400">({weight})</span>
                                </span>
                                <span className="font-mono font-bold text-slate-800">{value}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(value)}`}
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
