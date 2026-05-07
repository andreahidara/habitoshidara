"use client"

import React from 'react'
import { format, subDays } from 'date-fns'

interface HabitHeatmapProps {
  logs: { completed_date: string }[]
}

export function HabitHeatmap({ logs }: HabitHeatmapProps) {
  const today = new Date()
  const days = Array.from({ length: 60 }).map((_, i) => subDays(today, 59 - i))
  const completedSet = new Set(logs.map(log => log.completed_date))

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-1 overflow-x-auto pb-2 max-w-full">
        <div
          className="grid grid-rows-7 grid-flow-col gap-1.5 p-2 bg-[#f8f5f0] dark:bg-[#0a0f0a]/60 rounded-xl border border-[#3a5a40]/10 dark:border-[#3a5a40]/20"
          role="grid"
          aria-label="Historial de completados últimos 60 días"
        >
          {days.map((day) => {
            const formatted = format(day, 'yyyy-MM-dd')
            const completed = completedSet.has(formatted)
            return (
              <div
                key={formatted}
                role="gridcell"
                aria-label={`${format(day, 'd MMM')}: ${completed ? 'completado' : 'no completado'}`}
                title={format(day, 'dd MMM yyyy')}
                className={`w-3 h-3 rounded-[2px] transition-all duration-500 ${
                  completed
                    ? 'bg-[#3a5a40] shadow-[0_0_6px_rgba(58,90,64,0.4)]'
                    : 'bg-[#3a5a40]/10 dark:bg-[#3a5a40]/20'
                }`}
              />
            )
          })}
        </div>
      </div>
      <span className="text-[10px] text-[#3a5a40]/40 dark:text-[#a3b18a]/40 mt-2 font-black uppercase tracking-widest">
        Últimos 60 días
      </span>
    </div>
  )
}
