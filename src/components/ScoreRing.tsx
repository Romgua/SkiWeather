import { getScoreColor, getScoreLabel } from "@/lib/scoring";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ScoreRing({
  score,
  size = "md",
  showLabel = true,
}: ScoreRingProps) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-3xl",
  };

  const radius = size === "lg" ? 42 : size === "md" ? 28 : 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const viewBox = size === "lg" ? "0 0 96 96" : size === "md" ? "0 0 64 64" : "0 0 48 48";
  const center = size === "lg" ? 48 : size === "md" ? 32 : 24;
  const strokeWidth = size === "lg" ? 5 : 4;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`score-ring ${sizeClasses[size]}`}>
        <svg className="absolute -rotate-90" viewBox={viewBox}>
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700/50"
          />
          {/* Score ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={getScoreColor(score)}
          />
        </svg>
        <span className={`font-bold ${textClasses[size]} ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400">{getScoreLabel(score)}</span>
      )}
    </div>
  );
}
