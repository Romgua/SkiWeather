import type { DailyForecast } from "@/lib/types";
import { getWeatherDescription } from "@/lib/weather-codes";

interface WeatherRowProps {
  forecasts: DailyForecast[];
  compact?: boolean;
}

export function WeatherRow({ forecasts, compact = true }: WeatherRowProps) {
  const displayed = compact ? forecasts.slice(0, 5) : forecasts;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {displayed.map((day) => {
        const { icon, label } = getWeatherDescription(day.weatherCode);
        const dayName = new Date(day.date).toLocaleDateString("fr-FR", {
          weekday: "short",
        });

        return (
          <div
            key={day.date}
            className="flex flex-col items-center gap-0.5 min-w-[44px]"
            title={`${dayName}: ${label}`}
          >
            <span className="text-[10px] text-slate-500 capitalize">
              {dayName}
            </span>
            <span className="text-lg">{icon}</span>
            <span className="text-[10px] font-medium text-slate-300">
              {Math.round(day.temperatureMaxC)}°
            </span>
            {!compact && (
              <>
                <span className="text-[9px] text-slate-500">
                  {Math.round(day.temperatureMinC)}°
                </span>
                <span className="text-[9px] text-glacier-400">
                  {day.snowfallCm > 0
                    ? `${day.snowfallCm.toFixed(0)}cm`
                    : "—"}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
