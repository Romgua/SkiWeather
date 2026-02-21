import type { DailyForecast } from "@/lib/types";

interface SnowChartProps {
    daily: DailyForecast[];
    height?: number;
    width?: number;
}

export function SnowChart({ daily, height = 40, width = 120 }: SnowChartProps) {
    const snowData = daily.slice(0, 7).map((d) => d.snowfallCm);
    const maxSnow = Math.max(...snowData, 5);

    const padding = 2;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const barWidth = usableWidth / snowData.length - 2;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
        >
            {snowData.map((snow, i) => {
                const barHeight = (snow / maxSnow) * usableHeight;
                const x = padding + i * (barWidth + 2);
                const y = height - padding - barHeight;
                const hasSnow = snow > 0;

                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={padding}
                            width={barWidth}
                            height={usableHeight}
                            rx={2}
                            fill="rgba(255,255,255,0.04)"
                        />
                        {hasSnow && (
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx={2}
                                fill={snow >= 10 ? "#38bdf8" : "#0ea5e9"}
                                opacity={snow >= 10 ? 1 : 0.7}
                            />
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
