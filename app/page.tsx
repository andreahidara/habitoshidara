"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Flame, Plus, Trash2, Moon, Sun, CalendarDays, LogOut, CheckCircle2, LayoutDashboard, Brain, Activity, Sparkles, Loader2, Leaf, Clock } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import { useStore } from "@/store/useStore"
import { format } from 'date-fns'
import { HabitHeatmap } from '@/components/HabitHeatmap'
import { MoodSelector } from '@/components/MoodSelector'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
import confetti from 'canvas-confetti'
import dynamicImport from 'next/dynamic'

const AuthScreen = dynamicImport(() => import('@/components/AuthScreen').then(mod => mod.AuthScreen));
const AnalyticsDashboard = dynamicImport(() => import('@/components/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard));
const GlobalHeatmap = dynamicImport(() => import('@/components/GlobalHeatmap').then(mod => mod.GlobalHeatmap), { ssr: false });
const MoodHeatmap = dynamicImport(() => import('@/components/MoodHeatmap').then(mod => mod.MoodHeatmap), { ssr: false });
const EventHeatmap = dynamicImport(() => import('@/components/EventHeatmap').then(mod => mod.EventHeatmap), { ssr: false });
const BrainDump = dynamicImport(() => import('@/components/BrainDump').then(mod => mod.BrainDump));

// Variantes de animación
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, bounce: 0.4 } }
};

type TabId = 'home' | 'habits' | 'brain' | 'analytics';

/**
 * PALETA HIGH-CONTRAST MOSS (V5.2)
 * - Background: Lino Profundo (#e9e0d8) -> Más contraste con tarjetas
 * - Cards: Blanco Puro (#ffffff)
 * - Primary: Verde Musgo Profundo (#3a5a40)
 * - Accent: Barro (#a47148)
 * - Text: Bosque Negro (#283618)
 */

export default function Home() {
  const { 
    user, checkUser, signOut, isCheckingSession,
    events, habits, habitLogs, isLoading, 
    addEvent, deleteEvent, addHabit, deleteHabit, toggleHabitLog 
  } = useStore();
  
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Form states
  const [newHabit, setNewHabit] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("🌿");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkUser();
  }, [checkUser]);

  const handleAddHabit = async () => {
    if (newHabit.trim() === "") return;
    await addHabit({ name: newHabit, description: newHabitDesc, icon: newHabitIcon });
    setNewHabit("");
    setNewHabitDesc("");
    setNewHabitIcon("🌿");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDateClick = (arg: any) => {
    setSelectedDateStr(arg.dateStr);
    setNewEventTitle("");
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (newEventTitle.trim() === "") return;
    await addEvent({
      title: newEventTitle,
      date: selectedDateStr,
      all_day: true
    });
    setIsDialogOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = async (arg: any) => {
    if(confirm(`¿Deseas eliminar la tarea "${arg.event.title}"?`)) {
      await deleteEvent(arg.event.id);
    }
  };

  const todayStr = React.useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const triggerConfettiAndToggle = async (habitId: string, currentlyCompleted: boolean) => {
    await toggleHabitLog(habitId, todayStr);
    if (!currentlyCompleted) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.75 },
        colors: ['#3a5a40', '#588157', '#a47148', '#ffffff'],
        gravity: 0.8
      });
    }
  };

  const enrichedHabits = React.useMemo(() => {
    return habits.map(habit => {
      const logs = habitLogs.filter(log => log.habit_id === habit.id);
      const isCompletedToday = logs.some(log => log.completed_date === todayStr);
      const streak = logs.length;
      return { ...habit, logs, isCompletedToday, streak };
    });
  }, [habits, habitLogs, todayStr]);

  const completedTodayCount = enrichedHabits.filter(h => h.isCompletedToday).length;
  const totalHabits = enrichedHabits.length;

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Hábitos', icon: Leaf },
    { id: 'brain', label: 'Brain Dump', icon: Brain },
    { id: 'analytics', label: 'Estadísticas', icon: Activity },
  ] as const;

  if (!isMounted || (isCheckingSession && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e9e0d8] dark:bg-[#0a0f0a]">
         <div className="flex flex-col items-center gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
               <Loader2 className="w-10 h-10 text-[#3a5a40]" />
            </motion.div>
         </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return (
    <main className="min-h-screen bg-[#e9e0d8] dark:bg-[#0a0f0a] text-[#283618] dark:text-[#dad7cd] font-sans selection:bg-[#31572c]/40 transition-colors duration-500 overflow-x-hidden pb-24 relative px-2 sm:px-0">
      
      <header className="sticky top-0 z-50 w-full border-b border-[#3a5a40]/20 dark:border-[#3a5a40]/30 bg-white/95 dark:bg-[#1b221b]/98 backdrop-blur-md px-4 sm:px-8 py-5 shadow-2xl shadow-[#344e41]/10 transition-colors">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 flex items-center justify-center rounded-[1.2rem] bg-[#3a5a40] shadow-2xl text-white">
               <Leaf className="w-6 h-6" />
             </div>
             <h1 className="font-extrabold text-2xl tracking-tighter text-[#344e41] dark:text-[#dad7cd] leading-none uppercase">Dashboard</h1>
          </div>

          <nav className="flex items-center bg-[#dad7cd]/50 dark:bg-black/60 p-1.5 rounded-[2.5rem] border border-[#344e41]/10 backdrop-blur-md">
             {tabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id as TabId)} className={`relative flex items-center gap-3 px-8 py-3.5 rounded-[2rem] text-sm font-black transition-all ${isActive ? 'text-white dark:text-[#a3b18a] z-10' : 'text-[#3a5a40] dark:text-[#588157] hover:text-[#344e41] dark:hover:text-[#dad7cd]'}`}>
                   {isActive && ( <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#3a5a40] dark:bg-[#344e41] shadow-2xl rounded-[2rem]" transition={{ type: "spring", bounce: 0.1, duration: 0.7 }} /> )}
                   <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'scale-110' : ''}`} />
                   <span className="relative z-10 hidden md:inline">{tab.label}</span>
                 </button>
               )
             })}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full hover:bg-[#dad7cd]/40 text-[#3a5a40]">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-full text-red-600 hover:bg-red-50"> <LogOut className="h-5 w-5" /> </Button>
          </div>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1600px] mx-auto flex flex-col gap-12 mt-12 px-4 sm:px-8 relative z-10 w-full mb-12">
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <DashboardSkeleton view={activeTab} />
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab} 
              variants={containerVariants}
              initial="hidden" 
              animate="show" 
              exit={{ opacity: 0, x: -20 }} 
              transition={{ duration: 0.3 }} 
              className="w-full"
            >
              
              {/* DASHBOARD: CALENDARIO */}
              {activeTab === 'home' && (
                 <div className="flex flex-col gap-12 w-full">
                    <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
                      <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-8 sm:px-12 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
                        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter flex items-center gap-4 uppercase relative z-10">
                           <CalendarDays className="w-10 h-10 text-white/50" /> Planificador
                        </h2>
                        <div className="relative z-10 flex items-center gap-3 px-6 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-lg text-[12px] font-black uppercase text-white tracking-widest">
                           <Clock className="w-5 h-5 text-[#f2e9e4]" /> {format(new Date(), 'EEEE, d MMM')}
                        </div>
                      </div>
                      <CardContent className="p-4 sm:p-12 bg-white dark:bg-[#0a0f0a]/50">
                         <FullCalendar 
                            plugins={[dayGridPlugin, interactionPlugin]} 
                            initialView="dayGridMonth" 
                            events={events} 
                            dateClick={handleDateClick} 
                            eventClick={handleEventClick} 
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth' }} 
                            contentHeight="auto" 
                            aspectRatio={2.2}
                            firstDay={1}
                         />
                      </CardContent>
                    </Card>

                    <div className="pt-8">
                       <EventHeatmap />
                    </div>
                 </div>
              )}

              {/* HABITS: CENTRO DE GESTIÓN */}
              {activeTab === 'habits' && (
                 <div className="flex flex-col gap-10">

                    {/* HEADER */}
                    <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
                      <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-8 sm:px-12 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
                        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter flex items-center gap-4 uppercase relative z-10">
                           <Target className="w-10 h-10 text-white/50" /> Hábitos
                        </h2>
                        <div className="relative z-10 flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/10 rounded-[2rem] text-[12px] font-black uppercase text-white tracking-widest">
                           <Flame className="w-5 h-5 text-[#f2e9e4]/70" /> {completedTodayCount} / {totalHabits} hoy
                        </div>
                      </div>
                      <CardContent className="p-6 sm:p-10 bg-white dark:bg-[#0a0f0a]/50">
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
                       <h3 className="text-4xl font-black text-[#283618] dark:text-[#fefae0] tracking-tighter uppercase">
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

                    {enrichedHabits.length === 0 ? (
                       <div className="flex flex-col items-center justify-center p-16 text-center border-4 border-dashed border-[#3a5a40]/20 rounded-[3rem] bg-[#3a5a40]/5">
                          <div className="w-24 h-24 bg-[#3a5a40]/10 rounded-full flex items-center justify-center mb-6">
                             <Leaf className="w-12 h-12 text-[#3a5a40]" />
                          </div>
                          <h3 className="text-3xl font-black text-[#283618] dark:text-[#dad7cd] mb-4 uppercase tracking-tighter">Tu Jardín está Vacío</h3>
                          <p className="text-xl text-[#344e41]/70 dark:text-[#a3b18a] max-w-md font-bold text-balance">Comienza a cultivar tu mejor versión creando tu primer hábito arriba.</p>
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {enrichedHabits.map((habit) => (
                            <motion.div key={habit.id} variants={itemVariants} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, info) => { if (info.offset.x > 80) triggerConfettiAndToggle(habit.id, habit.isCompletedToday) }} className="h-full cursor-grab active:cursor-grabbing group">
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
                                      onClick={() => triggerConfettiAndToggle(habit.id, habit.isCompletedToday)}
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
                                        onClick={() => deleteHabit(habit.id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-2 rounded-xl sm:opacity-0 sm:group-hover:opacity-100"
                                      >
                                        <Trash2 className="w-4 h-4"/>
                                      </button>
                                    </div>
                                  </div>

                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                       </div>
                    )}
                    
                     <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10 mt-8">
                        <div className="bg-gradient-to-r from-[#344e41] to-[#3a5a40] dark:from-[#0a0f0a] dark:to-[#1b221b] px-8 sm:px-12 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
                           <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/5 blur-3xl rounded-full pointer-events-none" />
                           <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter flex items-center gap-4 uppercase relative z-10">
                              <Activity className="w-9 h-9 text-white/50" /> Estadísticas Anuales
                           </h3>
                           <span className="relative z-10 px-5 py-2 bg-white/10 border border-white/10 rounded-[2rem] text-[11px] font-black uppercase text-white/80 tracking-widest">
                              Últimos 365 días
                           </span>
                        </div>
                        <CardContent className="p-6 sm:p-10 bg-white dark:bg-[#0a0f0a]/50 flex flex-col gap-10">
                           <GlobalHeatmap />
                           <MoodHeatmap />
                        </CardContent>
                     </Card>
                 </div>
              )}

              {/* BRAIN DUMP */}
              {activeTab === 'brain' && (
                 <div>
                    <h2 className="text-5xl font-black text-[#283618] dark:text-[#fefae0] mb-14 tracking-tighter uppercase">Diario Interno</h2>
                    <BrainDump />
                 </div>
              )}

              {/* ESTADÍSTICAS */}
              {activeTab === 'analytics' && (
                 <div className="flex flex-col gap-10">

                    {/* Header */}
                    <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
                      <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-8 sm:px-12 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
                        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter flex items-center gap-4 uppercase relative z-10">
                           <LayoutDashboard className="w-10 h-10 text-white/50" /> Evolución
                        </h2>
                        <span className="relative z-10 px-5 py-2 bg-white/10 border border-white/10 rounded-[2rem] text-[11px] font-black uppercase text-white/80 tracking-widest">
                           Tu progreso global
                        </span>
                      </div>
                      <CardContent className="p-6 sm:p-10 bg-white dark:bg-[#0a0f0a]/50">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {/* Stat: Hábitos */}
                          <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-[#3a5a40]/5 border-2 border-[#3a5a40]/10 dark:border-[#3a5a40]/20 group hover:border-[#3a5a40]/30 transition-all">
                            <div className="w-14 h-14 bg-[#3a5a40]/10 rounded-[1.2rem] flex items-center justify-center flex-shrink-0">
                              <Target className="w-7 h-7 text-[#3a5a40]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-[#3a5a40] dark:text-[#a3b18a] uppercase tracking-widest opacity-70">Hábitos</p>
                              <h4 className="text-5xl font-black text-[#283618] dark:text-[#dad7cd] leading-none mt-1">{habits.length}</h4>
                            </div>
                          </div>
                          {/* Stat: Días */}
                          <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-[#a47148]/5 border-2 border-[#a47148]/10 dark:border-[#a47148]/20 group hover:border-[#a47148]/30 transition-all">
                            <div className="w-14 h-14 bg-[#a47148]/10 rounded-[1.2rem] flex items-center justify-center flex-shrink-0">
                              <Flame className="w-7 h-7 text-[#a47148]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-[#a47148] uppercase tracking-widest opacity-70">Días completados</p>
                              <h4 className="text-5xl font-black text-[#283618] dark:text-[#dad7cd] leading-none mt-1">{habitLogs.length}</h4>
                            </div>
                          </div>
                          {/* Stat: Notas */}
                          <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-[#588157]/5 border-2 border-[#588157]/10 dark:border-[#588157]/20 group hover:border-[#588157]/30 transition-all">
                            <div className="w-14 h-14 bg-[#588157]/10 rounded-[1.2rem] flex items-center justify-center flex-shrink-0">
                              <Brain className="w-7 h-7 text-[#588157]" />
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-[#588157] uppercase tracking-widest opacity-70">Ideas Registradas</p>
                              <h4 className="text-5xl font-black text-[#283618] dark:text-[#dad7cd] leading-none mt-1">{useStore.getState().notes.length}</h4>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Chart */}
                    <AnalyticsDashboard />

                 </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* DIALOG DE PROGRAMACIÓN */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl bg-white dark:bg-[#1b221b] p-0 w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#283618] dark:to-[#344e41] px-10 py-8 relative overflow-hidden">
            <div className="absolute top-[-30%] right-[-10%] w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-3xl font-black text-white tracking-tighter flex items-center gap-4 uppercase leading-none">
                <CalendarDays className="w-8 h-8 opacity-90" /> Nuevo Evento
              </DialogTitle>
              <DialogDescription className="font-bold text-white/80 text-sm flex items-center gap-2 uppercase tracking-widest mt-2">
                 {format(selectedDateStr ? new Date(selectedDateStr) : new Date(), 'EEEE, dd MMM yyyy')}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-10 space-y-8 bg-gradient-to-b from-transparent to-[#dad7cd]/10 dark:to-transparent">
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
    </main>
  );
}
