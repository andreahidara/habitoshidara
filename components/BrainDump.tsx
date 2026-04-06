"use client"

import React, { useState } from 'react'
import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Send, Brain, Leaf, Search, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

export function BrainDump() {
  const { notes, addNote, deleteNote } = useStore()
  const [newNote, setNewNote] = useState("")
  const [search, setSearch] = useState("")

  const handleAdd = async () => {
    if (newNote.trim() === "") return
    await addNote(newNote)
    setNewNote("")
  }

  const filteredNotes = notes.filter(n => n.content.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Input Area */}
         <div className="lg:col-span-4">
            <Card className="card-base border-t-0 sticky top-40 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/20">
               <CardHeader className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#344e41] py-8 px-10 text-white relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                  <CardTitle className="text-3xl font-black tracking-tighter flex items-center gap-4 uppercase leading-none relative z-10">
                     <Brain className="w-8 h-8 opacity-80" /> Búnker Mental
                  </CardTitle>
                  <p className="text-white/60 font-bold tracking-widest text-xs uppercase mt-2 relative z-10">Vacía tu RAM cognitiva</p>
               </CardHeader>
               <CardContent className="p-8 space-y-6 bg-white dark:bg-[#0a0f0a]/50">
                  <div className="relative">
                     <Textarea 
                        placeholder="Escribe lo que ocupa tu mente..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[200px] bg-[#f8f5f0] dark:bg-[#1b221b] border-2 border-[#3a5a40]/10 rounded-[1.5rem] p-6 text-lg font-bold tracking-tight text-[#344e41] dark:text-[#dad7cd] focus-visible:ring-4 focus-visible:ring-[#3a5a40]/10 focus-visible:border-[#3a5a40] resize-none transition-all placeholder:opacity-40 shadow-inner"
                        onKeyDown={(e) => {
                           if(e.key === "Enter" && e.ctrlKey) handleAdd()
                        }}
                     />
                     {newNote.length > 0 && (
                        <div className="absolute right-5 bottom-5 text-[#a47148] font-black text-[10px] px-2 py-1 bg-[#a47148]/10 rounded-lg">
                           {newNote.length} CHRS
                        </div>
                     )}
                  </div>
                  <Button onClick={handleAdd} disabled={!newNote.trim()} className="btn-primary w-full h-14 shadow-lg shadow-[#3a5a40]/20 disabled:opacity-40 group">
                     <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Registrar Semilla
                  </Button>
               </CardContent>
            </Card>
         </div>

         {/* Notes List */}
         <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Search */}
            <div className="relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3a5a40] opacity-40" />
               <input 
                  type="text" 
                  placeholder="Buscar ideas..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#1b221b] border-2 border-[#3a5a40]/10 dark:border-[#3a5a40]/20 rounded-[1.5rem] h-14 pl-14 pr-6 text-base font-bold tracking-tight text-[#344e41] dark:text-[#dad7cd] focus:ring-4 focus:ring-[#3a5a40]/10 focus:border-[#3a5a40] outline-none transition-all placeholder:opacity-30 shadow-sm"
               />
            </div>

            {/* Stats bar */}
            {notes.length > 0 && (
               <div className="flex items-center justify-between px-2">
                  <p className="text-xs font-black uppercase tracking-widest text-[#3a5a40] dark:text-[#a3b18a] opacity-60">
                     {filteredNotes.length} {filteredNotes.length === 1 ? 'idea' : 'ideas'} {search ? 'encontradas' : 'guardadas'}
                  </p>
                  <Sparkles className="w-4 h-4 text-[#a47148] opacity-40" />
               </div>
            )}

            {/* Notes grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <AnimatePresence mode="popLayout">
                  {filteredNotes.map((note) => (
                  <motion.div
                     key={note.id}
                     initial={{ opacity: 0, y: 16, scale: 0.97 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.94 }}
                     layout
                  >
                     <Card className="group overflow-hidden border border-[#3a5a40]/10 dark:border-[#3a5a40]/20 bg-white dark:bg-[#1b221b] hover:border-[#3a5a40]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-[1.5rem] border-l-4 border-l-[#3a5a40]/30 p-0">
                        <CardContent className="p-6 flex flex-col gap-4">
                           <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                 <span className="text-[11px] font-black px-3 py-1.5 bg-[#3a5a40]/5 dark:bg-[#344e41]/50 rounded-lg text-[#344e41] dark:text-[#a3b18a] uppercase tracking-widest">
                                    {format(new Date(note.created_at), 'dd MMM')}
                                 </span>
                                 <span className="text-[11px] font-black text-[#a47148] tracking-widest opacity-50">
                                    {format(new Date(note.created_at), 'HH:mm')}
                                 </span>
                              </div>
                              <button 
                                 onClick={() => deleteNote(note.id)}
                                 className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                           <p className="text-[#344e41] dark:text-[#dad7cd] font-semibold leading-relaxed whitespace-pre-wrap text-base">
                              {note.content}
                           </p>
                        </CardContent>
                     </Card>
                  </motion.div>
                  ))}
               </AnimatePresence>
            </div>

            {/* Empty state */}
            {filteredNotes.length === 0 && (
               <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                  <div className="w-20 h-20 bg-[#3a5a40]/5 rounded-full flex items-center justify-center">
                     <Leaf className="w-10 h-10 text-[#3a5a40] opacity-20" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-[#3a5a40] opacity-30">
                     {search ? 'Sin resultados' : 'Tu mente está en paz'}
                  </p>
               </div>
            )}
         </div>
      </div>
    </div>
  )
}
