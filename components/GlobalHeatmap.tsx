"use client"

import React from 'react'
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useStore } from "@/store/useStore"
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { useTheme } from 'next-themes'
import { Target } from 'lucide-react'

export function GlobalHeatmap() {
  const { habitLogs } = useStore()
  const { resolvedTheme } = useTheme()
  
  // PALETA MUSGO PROFUNDO (V5.2)
  const mossTheme: ThemeInput = {
    light: ['#f2e9e4', '#dad7cd', '#a3b18a', '#588157', '#3a5a40'],
    dark: ['#1b221b', '#344e41', '#3a5a40', '#588157', '#dad7cd']
  }

  const data = React.useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 365);
    
    const counts: Record<string, number> = {};
    habitLogs.forEach(log => {
      counts[log.completed_date] = (counts[log.completed_date] || 0) + 1;
    });

    const days = eachDayOfInterval({ start: startDate, end: today });
    return days.map(d => {
       const dateStr = format(d, 'yyyy-MM-dd');
       const count = counts[dateStr] || 0;
       
       let level = 0;
       if (count > 0 && count <= 2) level = 1;
       else if (count > 2 && count <= 4) level = 2;
       else if (count > 4 && count <= 6) level = 3;
       else if (count > 6) level = 4;

       return {
         date: dateStr,
         count: count,
         level: level as 0 | 1 | 2 | 3 | 4
       }
    })
  }, [habitLogs])

  return (
    <Card className="card-base border-t-[8px]">
      <CardHeader className="border-b-2 border-[#3a5a40]/10 px-6 py-5">
        <CardTitle className="text-2xl text-[#344e41] dark:text-[#dad7cd] font-black flex items-center gap-4 tracking-tighter uppercase leading-none">
           <Target className="w-7 h-7 text-[#3a5a40]" /> Disciplina Anual
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 overflow-x-auto custom-scrollbar">
         <div className="w-full flex justify-start 2xl:justify-center min-w-fit pr-4 pb-2">
            <ActivityCalendar 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={data as any} 
              theme={mossTheme}
              colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
              labels={{
                legend: { less: "Bajo", more: "Alto" },
                months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                totalCount: "Días cultivados en el último año"
              }}
              showWeekdayLabels
              blockSize={18}
              blockMargin={5}
              blockRadius={6}
            />
         </div>
      </CardContent>
    </Card>
  )
}
