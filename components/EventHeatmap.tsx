"use client"

import React from 'react'
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useStore } from "@/store/useStore"
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { useTheme } from 'next-themes'
import { CalendarDays } from 'lucide-react'

export function EventHeatmap() {
  const { events } = useStore()
  const { resolvedTheme } = useTheme()
  
  // PALETA CLAY / TIERRA (V5.2)
  const eventTheme: ThemeInput = {
    light: ['#f2e9e4', '#dad7cd', '#a47148', '#8b5e34', '#5c3d2e'],
    dark: ['#1b221b', '#3d2b1f', '#8b5e34', '#a47148', '#dad7cd']
  }

  const data = React.useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 365);
    
    const counts: Record<string, number> = {};
    events.forEach(ev => {
      const d = ev.date;
      counts[d] = (counts[d] || 0) + 1;
    });

    const days = eachDayOfInterval({ start: startDate, end: today });
    return days.map(d => {
       const dateStr = format(d, 'yyyy-MM-dd');
       const count = counts[dateStr] || 0;
       
       let level = 0;
       if (count === 1) level = 1;
       else if (count === 2) level = 2;
       else if (count === 3) level = 3;
       else if (count >= 4) level = 4;

       return {
         date: dateStr,
         count: count,
         level: level as 0 | 1 | 2 | 3 | 4
       }
    })
  }, [events])

  return (
    <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#a47148]/10">
      <CardHeader className="bg-gradient-to-r from-[#e9e0d8] to-[#dad7cd] dark:from-[#1b221b] dark:to-[#3d2b1f]/30 border-b-2 border-[#a47148]/10 px-6 py-5 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-5%] w-32 h-32 bg-[#a47148]/10 blur-2xl rounded-full pointer-events-none" />
        <CardTitle className="text-2xl text-[#283618] dark:text-[#dad7cd] font-black flex items-center gap-4 tracking-tighter uppercase leading-none relative z-10">
           <CalendarDays className="w-7 h-7 text-[#a47148]" /> Historial de Compromisos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 overflow-x-auto custom-scrollbar bg-white dark:bg-[#0a0f0a]/50">
         <div className="w-full flex justify-start 2xl:justify-center min-w-fit pr-4 pb-2">
            <ActivityCalendar 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={data as any} 
              theme={eventTheme}
              colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
              labels={{
                legend: { less: "Bajo", more: "Alto" },
                months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                totalCount: "Registro histórico del último año"
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
