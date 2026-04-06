"use client";

import React from 'react';
import { format, subDays } from 'date-fns';

interface HabitHeatmapProps {
  logs: { completed_date: string }[]; // dates in YYYY-MM-DD
}

export function HabitHeatmap({ logs }: HabitHeatmapProps) {
  // Generar las fechas de los últimos 60 días
  const today = new Date();
  const days = Array.from({ length: 60 }).map((_, i) => subDays(today, 59 - i));

  // Convertimos el array a un Set O(1) en búsqueda para acelerar renderizados.
  const completedSet = new Set(logs.map(log => log.completed_date));

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1 overflow-x-auto pb-2 max-w-full">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
          {days.map((day) => {
            const formatted = format(day, 'yyyy-MM-dd');
            const completed = completedSet.has(formatted);
            return (
              <div 
                key={formatted}
                title={format(day, 'MMM d, yyyy')}
                className={`w-3 h-3 rounded-[2px] transition-all duration-500 ${
                  completed 
                    ? 'bg-[#3a5a40] shadow-[0_0_10px_rgba(58,90,64,0.3)]' 
                    : 'bg-[#3a5a40]/10 dark:bg-white/5'
                }`}
              />
            );
          })}
        </div>
      </div>
      <span className="text-xs text-slate-400 mt-2 font-medium">Últimos 60 días</span>
    </div>
  );
}
