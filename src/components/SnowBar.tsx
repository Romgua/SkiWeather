interface SnowBarProps {
  days: { date: string; snowfallCm: number }[];
}

export function SnowBar({ days }: SnowBarProps) {
  const maxSnow = Math.max(...days.map((d) => d.snowfallCm), 5);

  return (
    <div className="flex items-end gap-1" style={{ height: "40px" }}>
      {days.map((day) => {
        const heightPercent = Math.max(
          4,
          (day.snowfallCm / maxSnow) * 100
        );
        const dayLabel = new Date(day.date).toLocaleDateString("fr-FR", {
          weekday: "short",
        });

        return (
          <div
            key={day.date}
            className="flex flex-col items-center gap-0.5"
            title={`${dayLabel}: ${day.snowfallCm.toFixed(1)}cm`}
          >
            <div
              className="snow-bar w-4 min-h-[2px]"
              style={{ height: `${heightPercent}%` }}
            />
            <span className="text-[9px] text-slate-500">
              {dayLabel.charAt(0).toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
