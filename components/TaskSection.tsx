"use client"

import { useState, useMemo, type ComponentType } from 'react'
import { useStore } from "@/store/useStore"
import type { TaskPriority } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, ListTodo, CheckSquare, Square, Sparkles, LayoutList, ChevronUp, Minus, ChevronDown, Loader2, Eraser } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'

type Priority = TaskPriority

const TASK_TITLE_MAX = 100

const PRIORITY_CONFIG: Record<Priority, { label: string; Icon: ComponentType<{ className?: string }>; ring: string; badge: string; dot: string }> = {
  high:   { label: 'Alta',  Icon: ChevronUp,   ring: 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',          badge: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800',     dot: 'bg-red-500' },
  medium: { label: 'Media', Icon: Minus,        ring: 'border-[#a47148]/40 bg-[#a47148]/10 dark:bg-[#a47148]/20 text-[#a47148]',             badge: 'bg-[#a47148]/10 dark:bg-[#a47148]/20 text-[#a47148] border-[#a47148]/30',                              dot: 'bg-[#a47148]' },
  low:    { label: 'Baja',  Icon: ChevronDown, ring: 'border-[#3a5a40]/30 bg-[#3a5a40]/10 dark:bg-[#3a5a40]/20 text-[#3a5a40] dark:text-[#a3b18a]', badge: 'bg-[#3a5a40]/10 dark:bg-[#3a5a40]/20 text-[#3a5a40] dark:text-[#a3b18a] border-[#3a5a40]/20', dot: 'bg-[#3a5a40]' },
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export function TaskSection() {
  const { tasks, addTask, toggleTask, deleteTask, clearCompletedTasks } = useStore()
  const [newTask, setNewTask] = useState("")
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(new Set())

  const { sortedTasks, completedCount, hasCompleted, allCompleted } = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1
      return PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium']
    })
    const completedCount = tasks.filter(t => t.is_completed).length
    return {
      sortedTasks: sorted,
      completedCount,
      hasCompleted: completedCount > 0,
      allCompleted: tasks.length > 0 && completedCount === tasks.length,
    }
  }, [tasks])

  const handleAdd = async () => {
    const trimmed = newTask.trim()
    if (!trimmed || trimmed.length > TASK_TITLE_MAX) return
    await addTask(trimmed, newPriority)
    setNewTask("")
    setNewPriority('medium')
  }

  const handleToggle = async (id: string, isCompleted: boolean) => {
    if (pendingTaskIds.has(id)) return
    setPendingTaskIds(prev => new Set(prev).add(id))
    try {
      await toggleTask(id, isCompleted)
      if (!isCompleted) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#3a5a40', '#a47148', '#ffffff']
        })
      }
    } finally {
      setPendingTaskIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-10 w-full max-w-4xl mx-auto px-2 sm:px-0">
      
      {/* Header Card */}
      <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
        <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-6 sm:px-10 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter flex items-center gap-3 sm:gap-4 uppercase relative z-10">
            <ListTodo className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" /> Tareas Diarias
          </h2>
          <div className="relative z-10 flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/10 rounded-[2rem] text-[10px] sm:text-[12px] font-black uppercase text-white tracking-widest">
            {completedCount} / {tasks.length} completadas
          </div>
        </div>
        
        <CardContent className="p-6 sm:p-10 bg-white dark:bg-[#0a0f0a]/50 flex flex-col gap-4">
          {/* Priority selector */}
          <div className="flex items-center gap-2">
            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
              const { label, Icon, ring } = PRIORITY_CONFIG[p]
              const active = newPriority === p
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setNewPriority(p)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-[1rem] border-2 text-xs font-black uppercase tracking-widest transition-all ${
                    active ? ring : 'border-transparent bg-[#f8f5f0] dark:bg-[#1b221b] text-[#344e41]/40 dark:text-[#dad7cd]/30 hover:opacity-70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              )
            })}
          </div>
          <div className="flex gap-3">
             <div className="relative flex-1">
                <Input
                   placeholder="¿Qué quieres conseguir hoy?"
                   value={newTask}
                   onChange={(e) => setNewTask(e.target.value.slice(0, TASK_TITLE_MAX))}
                   className="w-full bg-[#f8f5f0] dark:bg-[#1b221b] border-2 border-[#3a5a40]/10 rounded-[1.5rem] h-14 sm:h-16 px-6 text-base sm:text-lg font-bold tracking-tight text-[#344e41] dark:text-[#dad7cd] focus-visible:ring-4 focus-visible:ring-[#3a5a40]/10 focus-visible:border-[#3a5a40] transition-all placeholder:opacity-30 shadow-inner pr-20"
                   onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                {newTask.length > 0 && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black ${newTask.length >= TASK_TITLE_MAX ? 'text-red-500' : 'text-[#a47148]/50'}`}>
                    {newTask.length}/{TASK_TITLE_MAX}
                  </span>
                )}
             </div>
             <Button onClick={handleAdd} disabled={!newTask.trim() || newTask.length > TASK_TITLE_MAX} className="btn-primary aspect-square h-14 sm:h-16 w-14 sm:w-16 rounded-[1.5rem] shadow-lg shadow-[#3a5a40]/20 p-0 flex items-center justify-center">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear completed */}
      {hasCompleted && (
        <div className="flex justify-end">
          <button
            onClick={() => clearCompletedTasks()}
            className="flex items-center gap-2 px-4 py-2 rounded-[1rem] text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-all"
          >
            <Eraser className="w-3.5 h-3.5" /> Limpiar completadas
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {sortedTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="flex flex-col items-center justify-center p-12 sm:p-20 text-center border-4 border-dashed border-[#3a5a40]/10 rounded-[3rem] bg-[#3a5a40]/5"
            >
              <div className="w-20 h-20 bg-[#3a5a40]/10 rounded-full flex items-center justify-center mb-6">
                 <LayoutList className="w-10 h-10 text-[#3a5a40]" />
              </div>
              <h3 className="text-2xl font-black text-[#283618] dark:text-[#dad7cd] mb-3 uppercase tracking-tighter">Lista de hoy vacía</h3>
              <p className="text-[#344e41]/60 dark:text-[#a3b18a] font-bold max-w-xs mx-auto uppercase text-xs tracking-widest">Añade tu primera tarea arriba para empezar a tachar objetivos.</p>
            </motion.div>
          ) : (
            sortedTasks.map((task) => {
                const pCfg = PRIORITY_CONFIG[task.priority ?? 'medium']
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <Card className={`group relative overflow-hidden border-2 transition-all duration-300 rounded-[1.5rem] sm:rounded-[2rem] p-0 border-l-4 ${
                      task.is_completed
                        ? 'bg-[#3a5a40]/5 border-[#3a5a40]/20 dark:border-[#3a5a40]/30 border-l-[#3a5a40]/30'
                        : task.priority === 'high'
                          ? 'bg-white dark:bg-[#1b221b] border-[#dad7cd] dark:border-[#3a5a40]/10 hover:border-[#3a5a40]/30 shadow-sm hover:shadow-xl border-l-red-400'
                          : task.priority === 'low'
                            ? 'bg-white dark:bg-[#1b221b] border-[#dad7cd] dark:border-[#3a5a40]/10 hover:border-[#3a5a40]/30 shadow-sm hover:shadow-xl border-l-[#3a5a40]'
                            : 'bg-white dark:bg-[#1b221b] border-[#dad7cd] dark:border-[#3a5a40]/10 hover:border-[#3a5a40]/30 shadow-sm hover:shadow-xl border-l-[#a47148]'
                    }`}>
                      <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                        <button
                          onClick={() => handleToggle(task.id, task.is_completed)}
                          disabled={pendingTaskIds.has(task.id)}
                          aria-label={task.is_completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                            pendingTaskIds.has(task.id)
                              ? 'bg-[#3a5a40]/20 cursor-wait'
                              : task.is_completed
                                ? 'bg-[#3a5a40] text-white shadow-lg shadow-[#3a5a40]/30'
                                : 'bg-[#dad7cd]/30 dark:bg-black/20 text-[#3a5a40] hover:bg-[#3a5a40]/10'
                          }`}
                        >
                          {pendingTaskIds.has(task.id)
                            ? <Loader2 className="w-4 h-4 text-[#3a5a40] animate-spin" />
                            : task.is_completed
                              ? <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                              : <Square className="w-5 h-5 sm:w-6 sm:h-6" />
                          }
                        </button>

                        <span className={`flex-1 font-black text-base sm:text-xl tracking-tight transition-all truncate ${
                          task.is_completed ? 'text-[#3a5a40]/40 line-through' : 'text-[#344e41] dark:text-[#dad7cd]'
                        }`}>
                          {task.title}
                        </span>

                        {!task.is_completed && (
                          <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${pCfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pCfg.dot}`} />
                            {pCfg.label}
                          </span>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          aria-label="Eliminar tarea"
                          className="p-2 sm:p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
          )}
        </AnimatePresence>
      </div>

      {allCompleted && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center justify-center gap-4 p-8 rounded-[2.5rem] bg-gradient-to-r from-[#3a5a40] to-[#588157] text-white shadow-2xl shadow-[#3a5a40]/20"
        >
          <Sparkles className="w-8 h-8 animate-pulse" />
          <span className="text-xl font-black uppercase tracking-tighter">¡Día Completado! Eres imparable.</span>
        </motion.div>
      )}
    </div>
  )
}
