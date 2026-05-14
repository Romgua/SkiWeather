"use client";

import { useMemo } from "react";

interface DateSelectorProps {
    selectedDay: number;
    onSelectDay: (day: number) => void;
    availableDays: number;
}

const SHORT_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const SHORT_MONTHS = ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"];

export function DateSelector({ selectedDay, onSelectDay, availableDays }: DateSelectorProps) {
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const days = useMemo(() =>
        Array.from({ length: Math.min(availableDays, 7) }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return {
                index: i,
                label: i === 0 ? "Auj." : i === 1 ? "Dem." : SHORT_DAYS[d.getDay()],
                dayNum: d.getDate(),
                month: SHORT_MONTHS[d.getMonth()],
                isWeekend: d.getDay() === 0 || d.getDay() === 6,
            };
        }),
    [today, availableDays]);

    return (
        <div className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Je veux skier le…
            </p>
            <div className="grid grid-cols-7 gap-1.5">
                {days.map(({ index, label, dayNum, month, isWeekend }) => {
                    const isSelected = selectedDay === index;
                    return (
                        <button
                            key={index}
                            onClick={() => onSelectDay(index)}
                            className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 px-1 transition-all ${
                                isSelected
                                    ? "bg-blue-700 text-white shadow-md shadow-blue-200"
                                    : isWeekend
                                        ? "bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100"
                                        : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                            }`}
                        >
                            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                                {label}
                            </span>
                            <span className={`text-base font-bold leading-none ${isSelected ? "text-white" : "text-slate-800"}`}>
                                {dayNum}
                            </span>
                            <span className={`text-[10px] ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                                {month}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
