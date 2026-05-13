"use client"

import { useState, useCallback, memo } from 'react'
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle2, Trash2, Flame, Loader2 } from "lucide-react"
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
  isPending?: boolean
}

function HabitCardInner({ habit, onToggle, onDelete, isPending = false }: HabitCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleDragEnd = useCallback((_e: unknown, info: { offset: { x: number } }) => {
    if (!isPending && info.offset.x > 80) onToggle(habit.id, habit.isCompletedToday)
  }, [isPending, habit.id, habit.isCompletedToday, onToggle])

  return (
    <>
    <motion.div
      variants={itemVariants}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
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
              onClick={() => !isPending && onToggle(habit.id, habit.isCompletedToday)}
              disabled={isPending}
              aria-label={habit.isCompletedToday ? `Desmarcar hábito ${habit.name}` : `Completar hábito ${habit.name}`}
              title={isPending ? 'Guardando...' : habit.isCompletedToday ? 'Marcar como no completado' : 'Completar hoy'}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                isPending
                  ? 'border-[#3a5a40]/30 bg-[#3a5a40]/10 cursor-wait'
                  : habit.isCompletedToday
                    ? 'bg-[#3a5a40] border-[#3a5a40] text-white shadow-md shadow-[#3a5a40]/30 hover:bg-red-500 hover:border-red-500'
                    : 'border-[#dad7cd] dark:border-[#3a5a40]/40 bg-white/50 dark:bg-black/20 hover:border-[#3a5a40] hover:bg-[#3a5a40]/10'
              }`}
            >
              {isPending
                ? <Loader2 className="w-4 h-4 text-[#3a5a40] animate-spin" />
                : habit.isCompletedToday && <CheckCircle2 className="w-5 h-5" />
              }
            </button>
          </div>

          {/* Habit name + completed badge */}
          <div className="px-6 pb-4 flex-1 flex flex-col gap-1.5">
            <span className={`font-black text-xl tracking-tight leading-snug block ${
              habit.isCompletedToday ? 'text-[#3a5a40] dark:text-[#a3b18a]' : 'text-[#344e41] dark:text-[#dad7cd]'
            }`}>{habit.name}</span>
            {habit.isCompletedToday && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3a5a40]/60 dark:text-[#a3b18a]/60">
                ✓ completado hoy
              </span>
            )}
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
                onClick={() => setIsConfirmOpen(true)}
                aria-label={`Eliminar hábito ${habit.name}`}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-2 rounded-xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>

      <Dialog open={isConfirmOpen} onOpenChange={(open) => { if (!open) setIsConfirmOpen(false) }}>
        <DialogContent className="rounded-[2rem] border-0 shadow-2xl bg-white dark:bg-[#1b221b] p-0 w-[95vw] max-w-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-400 px-8 py-6 relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none" />
            <DialogHeader className="relative z-10 text-left">
              <DialogTitle className="text-2xl font-black text-white tracking-tighter flex items-center gap-3 uppercase leading-none">
                <Trash2 className="w-6 h-6 opacity-90" /> Eliminar Hábito
              </DialogTitle>
              <DialogDescription className="font-bold text-white/80 text-sm mt-2 uppercase tracking-widest">
                Se borrarán todos sus registros
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <p className="text-[#344e41] dark:text-[#dad7cd] font-bold text-lg leading-snug">
              ¿Eliminar <span className="font-black text-[#3a5a40] dark:text-[#a3b18a]">&quot;{habit.name}&quot;</span> y todo su historial?
            </p>
            <DialogFooter className="flex !flex-row gap-4">
              <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} className="flex-1 rounded-[1.2rem] font-bold h-14 bg-[#dad7cd]/30 dark:bg-white/5 hover:bg-[#dad7cd]/50 transition-all uppercase tracking-widest text-[#3a5a40] dark:text-[#a3b18a]">
                Cancelar
              </Button>
              <Button onClick={() => { onDelete(habit.id); setIsConfirmOpen(false) }} className="flex-1 rounded-[1.2rem] font-black h-14 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 uppercase tracking-widest transition-all">
                Eliminar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const HabitCard = memo(HabitCardInner)
