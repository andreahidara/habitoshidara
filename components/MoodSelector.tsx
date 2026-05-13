"use client"

import { useStore } from "@/store/useStore"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { MOODS } from '@/lib/constants'

export function MoodSelector() {
  const { moodLogs, setDailyMood } = useStore()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const currentMood = moodLogs.find(m => m.date === todayStr)?.mood

  return (
    <Card className="card-accent flex flex-col gap-6 sm:gap-8 border-t-[8px] border-t-[#a47148]/20 justify-center p-6 sm:p-10">
      <h3 className="text-2xl sm:text-3xl font-black text-[#344e41] dark:text-[#dad7cd] tracking-tighter uppercase leading-none text-center sm:text-left">
        Energía de Hoy
      </h3>

      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        {MOODS.map((m) => {
          const isSelected = currentMood === m.emoji
          return (
            <motion.button
              key={m.emoji}
              type="button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDailyMood(m.emoji, todayStr)}
              aria-label={`Estado de ánimo: ${m.label}${isSelected ? ' (seleccionado)' : ''}`}
              aria-pressed={isSelected}
              className={`flex flex-col items-center gap-2 sm:gap-3 py-3 sm:py-5 px-1 sm:px-2 rounded-[1.2rem] sm:rounded-[1.8rem] transition-all duration-300 relative ${
                isSelected
                  ? 'bg-[#3a5a40] shadow-4xl ring-4 ring-[#3a5a40]/20'
                  : 'bg-[#dad7cd]/20 dark:bg-black/40 hover:bg-[#dad7cd]/50 dark:hover:bg-[#344e41] opacity-50 hover:opacity-100 grayscale hover:grayscale-0'
              }`}
            >
              <span className="text-2xl sm:text-4xl filter drop-shadow-md leading-none" aria-hidden="true">
                {m.emoji}
              </span>
              <span className={`text-[8px] sm:text-[10px] font-black tracking-widest uppercase leading-none text-center ${
                isSelected ? 'text-white' : 'text-[#3a5a40] dark:text-[#a3b18a] opacity-70'
              }`}>
                {m.label}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="mood-active"
                  className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#a47148] rounded-full border-2 border-white dark:border-[#1b221b] shadow-lg"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </Card>
  )
}
