"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, YAxis, Cell } from 'recharts'
import { useStore } from "@/store/useStore"
import { format, subDays } from 'date-fns'
import { TrendingUp } from 'lucide-react'
import { useTheme } from 'next-themes'

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function AnalyticsDashboard() {
  const { habitLogs } = useStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const data = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(today, 6 - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      return {
        name: DIAS_ES[d.getDay()],
        completados: habitLogs.filter(l => l.completed_date === dateStr).length,
        fecha: format(d, 'dd/MM')
      }
    })
  }, [habitLogs])

  const tooltipStyle = {
    borderRadius: '1rem',
    border: `2px solid rgba(58, 90, 64, 0.15)`,
    backgroundColor: isDark ? 'rgba(27, 34, 27, 0.97)' : 'rgba(255, 255, 255, 0.97)',
    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '900',
    color: isDark ? '#dad7cd' : '#283618',
  }

  return (
    <Card className="card-base border-t-0 flex flex-col overflow-hidden p-0 shadow-2xl shadow-[#3a5a40]/10">
      <CardHeader className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#344e41] py-6 sm:py-8 px-6 sm:px-10 text-white relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none" />
        <CardTitle className="text-xl sm:text-2xl text-white flex items-center gap-3 sm:gap-4 font-black tracking-tighter uppercase leading-none relative z-10">
           <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" /> Rendimiento Semanal
        </CardTitle>
        <p className="text-white/60 font-bold tracking-widest text-[10px] sm:text-xs uppercase mt-2 relative z-10">Hábitos completados por día</p>
      </CardHeader>
      <CardContent className="p-4 sm:p-8 bg-white dark:bg-[#0a0f0a]/50">
        <div className="sr-only" role="table" aria-label="Datos del gráfico semanal">
          <div role="rowgroup">
            {data.map(d => (
              <div role="row" key={d.fecha}>
                <span role="cell">{d.name} ({d.fecha}): {d.completados} hábito{d.completados !== 1 ? 's' : ''} completado{d.completados !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300} aria-hidden="true">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#3a5a40" opacity={0.1} />
            <XAxis
               dataKey="name"
               axisLine={false}
               tickLine={false}
               tick={{ fill: isDark ? '#a3b18a' : '#3a5a40', fontSize: 13, fontWeight: 900 }}
               dy={10}
            />
            <YAxis
               axisLine={false}
               tickLine={false}
               tick={{ fill: '#a47148', fontSize: 12, fontWeight: 900 }}
               allowDecimals={false}
               width={30}
            />
            <Tooltip
              cursor={{ fill: '#3a5a40', opacity: 0.05 }}
              contentStyle={tooltipStyle}
              itemStyle={{ color: isDark ? '#a3b18a' : '#3a5a40' }}
              formatter={(value) => [`${Number(value)} hábito${Number(value) !== 1 ? 's' : ''}`, 'Completados']}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fecha ?? label}
            />
            <Bar dataKey="completados" radius={[10, 10, 0, 0]} maxBarSize={44} minPointSize={2}>
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.completados > 0 ? '#3a5a40' : isDark ? '#344e41' : '#dad7cd'} />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
