"use client"

import React from 'react'
import { useStore } from "@/store/useStore"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const moods = [
  { emoji: "😫", label: "Agotado" },
  { emoji: "😔", label: "Triste" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙂", label: "Bien" },
  { emoji: "😀", label: "Excelente" },
]

export function MoodSelector() {
  const { moodLogs, setDailyMood } = useStore()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  
  const currentMood = moodLogs.find(m => m.date === todayStr)?.mood

  return (
    <Card className="card-accent flex flex-col gap-6 border-t-[8px] border-t-[#a47148]/20 justify-center">
      <h3 className="text-3xl font-black text-[#344e41] dark:text-[#dad7cd] tracking-tighter uppercase leading-none">Energía de Hoy</h3>
      
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {moods.map((m) => {
          const isSelected = currentMood === m.emoji;
          return (
            <motion.button
              key={m.emoji}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDailyMood(m.emoji, todayStr)}
              className={`flex flex-col items-center gap-3 p-4 rounded-[1.5rem] transition-all duration-300 relative flex-1 ${
                isSelected 
                  ? 'bg-[#3a5a40] shadow-4xl ring-4 ring-[#3a5a40]/20' 
                  : 'bg-[#dad7cd]/20 dark:bg-black/40 hover:bg-[#dad7cd]/50 dark:hover:bg-[#344e41] opacity-40 hover:opacity-100 grayscale'
              }`}
            >
              <span className="text-4xl filter drop-shadow-md">{m.emoji}</span>
              <span className={`text-[8px] font-black tracking-widest uppercase leading-none ${isSelected ? 'text-white' : 'text-[#3a5a40] opacity-60'}`}>
                {m.label}
              </span>
              {isSelected && (
                <motion.div 
                  layoutId="mood-active"
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#a47148] rounded-full border-2 border-white dark:border-[#1b221b] shadow-xl"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </Card>
  )
}
