"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Trash2, Flame } from "lucide-react"
import { HabitHeatmap } from '@/components/HabitHeatmap'
import type { Variants } from "framer-motion"

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4 } }
}

interface HabitCardProps {
  habit: {
    id: string
    name: string
    icon: string
    isCompletedToday: boolean
    streak: number
    logs: { completed_date: string }[]
  }
  onToggle: (habitId: string, currentlyCompleted: boolean) => void
  onDelete: (habitId: string) => void
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  return (
    <motion.div 
      variants={itemVariants} 
      drag="x" 
      dragConstraints={{ left: 0, right: 0 }} 
      dragElastic={0.2} 
      onDragEnd={(e, info) => { 
        if (info.offset.x > 80) onToggle(habit.id, habit.isCompletedToday) 
      }} 
      className="h-full cursor-grab active:cursor-grabbing group"
    >
      <Card className={`h-full border-2 overflow-hidden p-0 transition-all duration-500 ease-out rounded-[2rem] ${
        habit.isCompletedToday
          ? 'bg-gradient-to-b from-[#3a5a40]/10 to-[#3a5a40]/5 border-[#3a5a40]/30 shadow-lg shadow-[#3a5a40]/10'
          : 'bg-white dark:bg-[#1b221b] border-[#dad7cd] dark:border-[#3a5a40]/20 shadow-xl hover:shadow-2xl hover:border-[#3a5a40]/30 hover:-translate-y-0.5'
      }`}>
        <CardContent className="p-0 flex flex-col h-full relative">

          {/* Completed overlay */}
          {habit.isCompletedToday && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#3a5a40]/5 to-transparent pointer-events-none rounded-[2rem]" />
          )}

          {/* Top section: icon + check */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className={`w-14 h-14 rounded-[1.4rem] text-3xl leading-none flex items-center justify-center flex-shrink-0 transition-all ${
              habit.isCompletedToday
                ? 'bg-[#3a5a40]/15 border-2 border-[#3a5a40]/20'
                : 'bg-[#dad7cd]/40 dark:bg-[#283618] border-2 border-white dark:border-[#3a5a40]/20 shadow-sm'
            }`}>{habit.icon}</div>
            <button
              onClick={() => onToggle(habit.id, habit.isCompletedToday)}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                habit.isCompletedToday
                  ? 'bg-[#3a5a40] border-[#3a5a40] text-white shadow-md shadow-[#3a5a40]/30'
                  : 'border-[#dad7cd] dark:border-[#3a5a40]/40 bg-white/50 dark:bg-black/20 hover:border-[#3a5a40] hover:bg-[#3a5a40]/10'
              }`}
            >
              {habit.isCompletedToday && <CheckCircle2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Habit name */}
          <div className="px-6 pb-4 flex-1">
            <span className={`font-black text-xl tracking-tight leading-snug block ${
              habit.isCompletedToday ? 'text-[#3a5a40]/50 dark:text-[#a3b18a]/50 line-through' : 'text-[#344e41] dark:text-[#dad7cd]'
            }`}>{habit.name}</span>
          </div>

          {/* Bottom section: heatmap + streak */}
          <div className="px-6 pt-4 pb-6 border-t border-[#3a5a40]/8 dark:border-[#3a5a40]/15 bg-[#f8f5f0]/60 dark:bg-black/10 rounded-b-[2rem]">
            <HabitHeatmap logs={habit.logs} />
            <div className="flex justify-between items-center mt-4">
              <span className={`text-xs font-black flex items-center gap-1.5 uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                habit.streak > 0
                  ? 'text-[#a47148] bg-[#a47148]/5 border-[#a47148]/15'
                  : 'text-[#3a5a40] dark:text-[#a3b18a] bg-[#3a5a40]/5 border-[#3a5a40]/10'
              }`}>
                <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? 'text-[#a47148]' : 'opacity-40'}`} />
                {habit.streak > 0 ? `${habit.streak} D` : 'Sin racha'}
              </span>
              <button
                onClick={() => onDelete(habit.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-2 rounded-xl sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
