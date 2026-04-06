"use client"

import React from 'react'
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useStore } from "@/store/useStore"
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { useTheme } from 'next-themes'
import { Smile } from 'lucide-react'

export function MoodHeatmap() {
  const { moodLogs } = useStore()
  const { resolvedTheme } = useTheme()
  
  const moodTheme: ThemeInput = {
    light: ['#f2e9e4', '#a47148', '#dad7cd', '#588157', '#3a5a40'],
    dark: ['#1b221b', '#a47148', '#344e41', '#3a5a40', '#dad7cd']
  }

  const moodToLevel = (mood: string): number => {
    switch(mood) {
      case '😫': return 1;
      case '😔': return 2;
      case '😐': return 2;
      case '🙂': return 3;
      case '😀': return 4;
      default: return 0;
    }
  }

  const data = React.useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 365);
    
    const moodMap: Record<string, string> = {};
    moodLogs.forEach(log => {
      moodMap[log.date] = log.mood;
    });

    const days = eachDayOfInterval({ start: startDate, end: today });
    return days.map(d => {
       const dateStr = format(d, 'yyyy-MM-dd');
       const mood = moodMap[dateStr];
       
       return {
         date: dateStr,
         count: mood ? 1 : 0,
         level: mood ? moodToLevel(mood) : 0 as 0 | 1 | 2 | 3 | 4
       }
    })
  }, [moodLogs])

  return (
    <Card className="card-base border-t-[8px] border-[#a47148]/20">
      <CardHeader className="border-b-2 border-[#a47148]/10 px-6 py-5">
        <CardTitle className="text-2xl text-[#344e41] dark:text-[#dad7cd] font-black flex items-center gap-4 tracking-tighter uppercase leading-none">
           <Smile className="w-7 h-7 text-[#a47148]" /> Energía Anual
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 overflow-x-auto custom-scrollbar">
         <div className="w-full flex justify-start 2xl:justify-center min-w-fit pr-4 pb-2">
            <ActivityCalendar 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={data as any} 
              theme={moodTheme}
              colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
              labels={{
                legend: { less: "Bajo", more: "Alto" },
                months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                totalCount: "Registro energético de los últimos 365 días"
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
