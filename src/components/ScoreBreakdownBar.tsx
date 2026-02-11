import type { ScoreBreakdown } from "@/lib/types";

interface ScoreBreakdownBarProps {
  breakdown: ScoreBreakdown;
}

const CATEGORIES: {
  key: keyof Omit<ScoreBreakdown, "total">;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { key: "snow", label: "Neige fraîche", emoji: "❄️", color: "bg-cyan-400" },
  { key: "snowpack", label: "Enneigement", emoji: "🏔️", color: "bg-blue-400" },
  { key: "weather", label: "Météo", emoji: "☀️", color: "bg-amber-400" },
  { key: "wind", label: "Vent", emoji: "💨", color: "bg-purple-400" },
  { key: "opening", label: "Ouverture", emoji: "🚡", color: "bg-green-400" },
];

export function ScoreBreakdownBar({ breakdown }: ScoreBreakdownBarProps) {
  return (
    <div className="space-y-1.5">
      {CATEGORIES.map(({ key, label, emoji, color }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-xs w-4">{emoji}</span>
          <span className="text-[10px] text-slate-400 w-20 truncate">
            {label}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
            <div
              className={`h-full rounded-full ${color} transition-all duration-700`}
              style={{ width: `${breakdown[key]}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-300 w-6 text-right">
            {breakdown[key]}
          </span>
        </div>
      ))}
    </div>
  );
}
