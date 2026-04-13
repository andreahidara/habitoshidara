"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarDays, Clock } from "lucide-react"

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'
import { EventClickArg } from '@fullcalendar/core'

import { useStore } from "@/store/useStore"
import { format } from 'date-fns'
import dynamic from 'next/dynamic'

const EventHeatmap = dynamic(() => import('@/components/EventHeatmap').then(mod => mod.EventHeatmap), { ssr: false })

export function PlannerView() {
  const { events, addEvent, deleteEvent } = useStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState("")
  const [newEventTitle, setNewEventTitle] = useState("")

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDateStr(arg.dateStr)
    setNewEventTitle("")
    setIsDialogOpen(true)
  }

  const handleSaveEvent = async () => {
    if (newEventTitle.trim() === "") return
    await addEvent({
      title: newEventTitle,
      date: selectedDateStr,
      all_day: true
    })
    setIsDialogOpen(false)
  }

  const handleEventClick = async (arg: EventClickArg) => {
    if(window.confirm(`¿Deseas eliminar la tarea "${arg.event.title}"?`)) {
      await deleteEvent(arg.event.id)
    }
  }

  return (
    <div className="flex flex-col gap-12 w-full">
      <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
        <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-6 sm:px-12 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter flex items-center gap-3 sm:gap-4 uppercase relative z-10">
              <CalendarDays className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" /> Planificador
          </h2>
          <div className="relative z-10 flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-lg text-[10px] sm:text-[12px] font-black uppercase text-white tracking-widest">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#f2e9e4]" /> {format(new Date(), 'EEEE, d MMM')}
          </div>
        </div>
        <CardContent className="p-2 sm:p-12 bg-white dark:bg-[#0a0f0a]/50">
            <div className="calendar-container overflow-hidden">
              <FullCalendar 
                  plugins={[dayGridPlugin, interactionPlugin]} 
                  initialView="dayGridMonth" 
                  events={events} 
                  dateClick={handleDateClick} 
                  eventClick={handleEventClick} 
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth' }} 
                  contentHeight="auto" 
                  aspectRatio={1.2}
                  firstDay={1}
              />
            </div>
        </CardContent>
      </Card>

      <div className="pt-4 sm:pt-8 overflow-x-auto pb-4">
          <EventHeatmap />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2rem] sm:rounded-[2.5rem] border-0 shadow-2xl bg-white dark:bg-[#1b221b] p-0 w-[95vw] max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#283618] dark:to-[#344e41] px-6 sm:px-10 py-6 sm:py-8 relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none" />
            <DialogHeader className="relative z-10 text-left">
              <DialogTitle className="text-2xl sm:text-3xl font-black text-white tracking-tighter flex items-center gap-3 sm:gap-4 uppercase leading-none">
                <CalendarDays className="w-7 h-7 sm:w-8 sm:h-8 opacity-90" /> Nuevo Evento
              </DialogTitle>
              <DialogDescription className="font-bold text-white/80 text-[12px] sm:text-sm flex items-center gap-2 uppercase tracking-widest mt-2">
                 {format(selectedDateStr ? new Date(selectedDateStr) : new Date(), 'EEEE, dd MMM yyyy')}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 bg-gradient-to-b from-transparent to-[#dad7cd]/10 dark:to-transparent">
            <div className="space-y-4">
               <label className="text-xs font-black uppercase tracking-widest text-[#3a5a40] dark:text-[#a3b18a] ml-4 opacity-70">
                 Título del Compromiso
               </label>
               <Input 
                 placeholder="Ej. Diseño UI/UX..." 
                 value={newEventTitle} 
                 onChange={(e) => setNewEventTitle(e.target.value)} 
                 className="w-full bg-white dark:bg-[#0a0f0a]/50 border-2 border-[#3a5a40]/10 dark:border-[#3a5a40]/20 rounded-[1.5rem] h-16 px-6 text-xl font-bold tracking-tight text-[#344e41] dark:text-[#dad7cd] focus-visible:ring-4 focus-visible:ring-[#3a5a40]/10 focus-visible:border-[#3a5a40] shadow-inner transition-all placeholder:opacity-30" 
                 autoFocus 
                 onKeyDown={(e) => {
                    if(e.key === "Enter") handleSaveEvent()
                 }}
               />
            </div>
            
            <DialogFooter className="pt-4 flex !flex-row gap-4">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-[1.2rem] font-bold h-14 text-sm border-2 border-transparent bg-[#dad7cd]/30 dark:bg-white/5 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all uppercase tracking-widest text-[#3a5a40] dark:text-gray-400">
                Cancelar
              </Button>
              <Button onClick={handleSaveEvent} disabled={!newEventTitle.trim()} className="btn-primary flex-1 rounded-[1.2rem] font-black h-14 text-sm uppercase tracking-widest disabled:opacity-50 transition-all">
                Guardar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
