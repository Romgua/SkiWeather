interface ScoreBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    animated?: boolean;
    onDark?: boolean; // true = fond coloré (hero), false = fond blanc (cartes)
}

function getScoreColorHex(score: number): string {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#38bdf8";
    if (score >= 40) return "#fbbf24";
    if (score >= 20) return "#fb923c";
    return "#f87171";
}

function getScoreLabel(score: number): string {
    if (score >= 85) return "Exceptionnel";
    if (score >= 70) return "Excellent";
    if (score >= 55) return "Très bon";
    if (score >= 40) return "Bon";
    if (score >= 25) return "Moyen";
    return "Défavorable";
}

const sizes = {
    sm: { box: "h-12 w-12", text: "text-sm", radius: 18, stroke: 3 },
    md: { box: "h-16 w-16", text: "text-lg", radius: 24, stroke: 3.5 },
    lg: { box: "h-24 w-24", text: "text-3xl", radius: 38, stroke: 4 },
};

export function ScoreBadge({
    score,
    size = "md",
    showLabel = false,
    animated = true,
    onDark = false,
}: ScoreBadgeProps) {
    const s = sizes[size];
    const circumference = 2 * Math.PI * s.radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColorHex(score);
    const trackColor = onDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.08)";
    const labelColor = onDark ? "text-white/80" : "text-slate-500";

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`relative ${s.box}`}>
                <svg className="score-ring w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={s.radius} fill="none" stroke={trackColor} strokeWidth={s.stroke} />
                    <circle
                        cx="50" cy="50" r={s.radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={s.stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={animated ? ({ "--score-offset": offset, animation: "scoreFill 1s ease-out forwards" } as React.CSSProperties) : undefined}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-bold ${s.text} font-mono`} style={{ color }}>{score}</span>
                </div>
            </div>
            {showLabel && (
                <span className={`text-xs font-medium ${labelColor}`}>{getScoreLabel(score)}</span>
            )}
        </div>
    );
}
