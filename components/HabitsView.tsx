"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Target, Flame, Plus, Sparkles, Leaf } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import { format } from 'date-fns'

import { useStore } from "@/store/useStore"
import { MoodSelector } from '@/components/MoodSelector'
import { HabitCard } from '@/components/HabitCard'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export function HabitsView() {
  const { habits, habitLogs, addHabit, deleteHabit, toggleHabitLog } = useStore()
  
  const [newHabit, setNewHabit] = useState("")
  const [newHabitIcon, setNewHabitIcon] = useState("🌿")

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const handleAddHabit = async () => {
    if (newHabit.trim() === "") return
    // description was removed from UI in previous versions, pass empty string
    await addHabit({ name: newHabit, description: "", icon: newHabitIcon })
    setNewHabit("")
    setNewHabitIcon("🌿")
  }

  const triggerConfettiAndToggle = async (habitId: string, currentlyCompleted: boolean) => {
    await toggleHabitLog(habitId, todayStr)
    if (!currentlyCompleted) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.75 },
        colors: ['#3a5a40', '#588157', '#a47148', '#ffffff'],
        gravity: 0.8
      })
    }
  }

  const enrichedHabits = useMemo(() => {
    return habits.map(habit => {
      const logs = habitLogs.filter(log => log.habit_id === habit.id)
      const isCompletedToday = logs.some(log => log.completed_date === todayStr)
      const streak = logs.length
      return { ...habit, logs, isCompletedToday, streak }
    })
  }, [habits, habitLogs, todayStr])

  const completedTodayCount = enrichedHabits.filter(h => h.isCompletedToday).length
  const totalHabits = enrichedHabits.length

  return (
    <div className="flex flex-col gap-10">
      {/* HEADER */}
      <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
        <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-6 sm:px-12 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter flex items-center gap-3 sm:gap-4 uppercase relative z-10">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" /> Hábitos
          </h2>
          <div className="relative z-10 flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 border border-white/10 rounded-[2rem] text-[10px] sm:text-[12px] font-black uppercase text-white tracking-widest">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#f2e9e4]/70" /> {completedTodayCount} / {totalHabits} hoy
          </div>
        </div>
        <CardContent className="p-4 sm:p-10 bg-white dark:bg-[#0a0f0a]/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* CREAR HÁBITO */}
            <div className="space-y-5 p-8 rounded-[2rem] bg-[#3a5a40]/5 dark:bg-[#3a5a40]/10 border-2 border-[#3a5a40]/10 dark:border-[#3a5a40]/20">
                <div className="flex items-center gap-4 text-[#3a5a40] dark:text-[#a3b18a] font-black text-2xl tracking-tighter uppercase leading-none mb-4">
                  <div className="p-2.5 bg-[#3a5a40]/10 rounded-xl"><Plus className="w-6 h-6" /></div> Nuevo Hábito
                </div>
                <div className="p-3 bg-white/80 dark:bg-black/20 rounded-[1.5rem] border border-[#3a5a40]/10 flex items-center justify-between overflow-x-auto gap-2">
                  {["🌿", "💧", "🏃", "📚", "🧘", "💪", "🍎"].map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => setNewHabitIcon(emoji)} 
                        className={`text-2xl p-2.5 rounded-xl transition-all flex-shrink-0 ${newHabitIcon === emoji ? 'bg-[#3a5a40] shadow-md scale-110' : 'hover:bg-[#dad7cd]/60 dark:hover:bg-[#3a5a40]/30 opacity-60 hover:opacity-100'}`}
                      >
                        {emoji}
                      </button>
                  ))}
                </div>
                <Input 
                  placeholder="Ej. Meditación matutina" 
                  value={newHabit} 
                  onChange={(e) => setNewHabit(e.target.value)} 
                  className="w-full bg-white dark:bg-[#0a0f0a]/50 border-2 border-[#3a5a40]/10 dark:border-[#3a5a40]/20 rounded-[1.5rem] h-14 px-6 text-lg font-bold text-[#344e41] dark:text-[#dad7cd] focus-visible:ring-4 focus-visible:ring-[#3a5a40]/10 focus-visible:border-[#3a5a40] transition-all placeholder:opacity-30 shadow-inner" 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                />
                <Button onClick={handleAddHabit} disabled={!newHabit.trim()} className="btn-primary w-full h-14 shadow-lg shadow-[#3a5a40]/20 disabled:opacity-50 group">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Sembrar Hábito
                </Button>
            </div>

            {/* MOOD TRACKER */}
            <MoodSelector />
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN HÁBITOS DIARIOS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
          <h3 className="text-3xl sm:text-4xl font-black text-[#283618] dark:text-[#fefae0] tracking-tighter uppercase">
            Hábitos Diarios
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#3a5a40] dark:text-[#a3b18a] opacity-60">{completedTodayCount} de {totalHabits}</p>
                <div className="w-32 h-2 bg-[#dad7cd] dark:bg-[#1b221b] rounded-full overflow-hidden mt-1">
                  <div 
                      className="h-full bg-[#3a5a40] dark:bg-[#588157] rounded-full transition-all duration-700" 
                      style={{ width: totalHabits > 0 ? `${Math.round((completedTodayCount / totalHabits) * 100)}%` : '0%' }}
                  />
                </div>
            </div>
          </div>
      </div>

      <AnimatePresence mode="popLayout">
        {enrichedHabits.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-16 text-center border-4 border-dashed border-[#3a5a40]/20 rounded-[3rem] bg-[#3a5a40]/5"
          >
              <div className="w-24 h-24 bg-[#3a5a40]/10 rounded-full flex items-center justify-center mb-6">
                <Leaf className="w-12 h-12 text-[#3a5a40]" />
              </div>
              <h3 className="text-3xl font-black text-[#283618] dark:text-[#dad7cd] mb-4 uppercase tracking-tighter">Tu Jardín está Vacío</h3>
              <p className="text-xl text-[#344e41]/70 dark:text-[#a3b18a] max-w-md font-bold text-balance">Comienza a cultivar tu mejor versión creando tu primer hábito arriba.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
              {enrichedHabits.map((habit) => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onToggle={triggerConfettiAndToggle} 
                  onDelete={deleteHabit} 
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
