"use client"

import React, { useState } from 'react'
import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, ListTodo, CheckSquare, Square, Sparkles, LayoutList } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'

export function TaskSection() {
  const { tasks, addTask, toggleTask, deleteTask } = useStore()
  const [newTask, setNewTask] = useState("")

  const handleAdd = async () => {
    if (newTask.trim() === "") return
    await addTask(newTask)
    setNewTask("")
  }

  const handleToggle = async (id: string, isCompleted: boolean) => {
    await toggleTask(id, isCompleted)
    if (!isCompleted) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#3a5a40', '#a47148', '#ffffff']
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
            {tasks.filter(t => t.is_completed).length} / {tasks.length} completadas
          </div>
        </div>
        
        <CardContent className="p-6 sm:p-10 bg-white dark:bg-[#0a0f0a]/50 flex flex-col gap-6">
          <div className="flex gap-3">
             <div className="relative flex-1">
                <Input 
                   placeholder="¿Qué quieres conseguir hoy?" 
                   value={newTask} 
                   onChange={(e) => setNewTask(e.target.value)}
                   className="w-full bg-[#f8f5f0] dark:bg-[#1b221b] border-2 border-[#3a5a40]/10 rounded-[1.5rem] h-14 sm:h-16 px-6 text-base sm:text-lg font-bold tracking-tight text-[#344e41] dark:text-[#dad7cd] focus-visible:ring-4 focus-visible:ring-[#3a5a40]/10 focus-visible:border-[#3a5a40] transition-all placeholder:opacity-30 shadow-inner"
                   onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
             </div>
             <Button onClick={handleAdd} disabled={!newTask.trim()} className="btn-primary aspect-square h-14 sm:h-16 w-14 sm:w-16 rounded-[1.5rem] shadow-lg shadow-[#3a5a40]/20 p-0 flex items-center justify-center">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
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
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className={`group relative overflow-hidden border-2 transition-all duration-300 rounded-[1.5rem] sm:rounded-[2rem] p-0 ${
                  task.is_completed 
                    ? 'bg-[#3a5a40]/5 border-[#3a5a40]/20 dark:border-[#3a5a40]/30' 
                    : 'bg-white dark:bg-[#1b221b] border-[#dad7cd] dark:border-[#3a5a40]/10 hover:border-[#3a5a40]/30 shadow-sm hover:shadow-xl'
                }`}>
                  <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                    <button 
                      onClick={() => handleToggle(task.id, task.is_completed)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                        task.is_completed 
                          ? 'bg-[#3a5a40] text-white shadow-lg shadow-[#3a5a40]/30' 
                          : 'bg-[#dad7cd]/30 dark:bg-black/20 text-[#3a5a40] hover:bg-[#3a5a40]/10'
                      }`}
                    >
                      {task.is_completed ? <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" /> : <Square className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                    
                    <span className={`flex-1 font-black text-base sm:text-xl tracking-tight transition-all truncate ${
                      task.is_completed ? 'text-[#3a5a40]/40 line-through' : 'text-[#344e41] dark:text-[#dad7cd]'
                    }`}>
                      {task.title}
                    </span>

                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 sm:p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {tasks.length > 0 && tasks.every(t => t.is_completed) && (
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
