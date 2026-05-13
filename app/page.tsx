"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toast } from "@/components/ui/Toast"
import { Target, Flame, Moon, Sun, LayoutDashboard, Brain, Activity, Loader2, Leaf, ListTodo, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"

import { useStore } from "@/store/useStore"
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
import dynamicImport from 'next/dynamic'

const AuthScreen = dynamicImport(() => import('@/components/AuthScreen').then(mod => mod.AuthScreen));
const AnalyticsDashboard = dynamicImport(() => import('@/components/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard));
const GlobalHeatmap = dynamicImport(() => import('@/components/GlobalHeatmap').then(mod => mod.GlobalHeatmap), { ssr: false });
const MoodHeatmap = dynamicImport(() => import('@/components/MoodHeatmap').then(mod => mod.MoodHeatmap), { ssr: false });
const PlannerView = dynamicImport(() => import('@/components/PlannerView').then(mod => mod.PlannerView));
const HabitsView = dynamicImport(() => import('@/components/HabitsView').then(mod => mod.HabitsView));
const BrainDump = dynamicImport(() => import('@/components/BrainDump').then(mod => mod.BrainDump));
const TaskSection = dynamicImport(() => import('@/components/TaskSection').then(mod => mod.TaskSection));

type TabId = 'home' | 'habits' | 'tasks' | 'brain' | 'analytics';

const TAB_ORDER: TabId[] = ['home', 'habits', 'tasks', 'brain', 'analytics'];

const tabVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring' as const, bounce: 0.15, duration: 0.45 } },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0, transition: { duration: 0.2 } }),
};

export default function Home() {
  const {
    user, checkUser, signOut, isCheckingSession,
    habits, habitLogs, notes, isLoading
  } = useStore();

  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [direction, setDirection] = useState(1);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    checkUser();
  }, [checkUser]);

  const handleTabChange = (newTab: TabId) => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setDirection(newIndex >= currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'Hábitos', icon: Leaf },
    { id: 'tasks', label: 'Tareas', icon: ListTodo },
    { id: 'brain', label: 'Brain Dump', icon: Brain },
    { id: 'analytics', label: 'Estadísticas', icon: Activity },
  ] as const;

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e9e0d8] dark:bg-[#0a0f0a]">
        <div role="status" aria-label="Iniciando sesión" className="flex flex-col items-center gap-10">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.7 }}
            className="w-20 h-20 flex items-center justify-center rounded-[1.8rem] bg-[#3a5a40] shadow-2xl shadow-[#3a5a40]/30"
          >
            <Leaf className="w-10 h-10 text-white" aria-hidden="true" />
          </motion.div>
          <div className="flex flex-col items-center gap-4">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[11px] font-black uppercase tracking-[0.3em] text-[#3a5a40]/40 dark:text-[#a3b18a]/40"
            >
              Preparando tu jardín
            </motion.p>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
              <Loader2 className="w-5 h-5 text-[#3a5a40]/30 dark:text-[#a3b18a]/30" aria-hidden="true" />
            </motion.div>
          </div>
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return (
    <main className="min-h-screen bg-[#e9e0d8] dark:bg-[#0a0f0a] text-[#283618] dark:text-[#dad7cd] font-sans selection:bg-[#31572c]/40 transition-colors duration-500 overflow-x-hidden pb-24 relative px-2 sm:px-0">

      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#3a5a40]/[0.06] dark:bg-[#3a5a40]/10 blur-[120px]" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-[450px] h-[450px] rounded-full bg-[#a47148]/[0.04] dark:bg-[#a47148]/[0.07] blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full bg-[#588157]/[0.04] dark:bg-[#588157]/[0.06] blur-[100px]" />
      </div>
      
      <header className="sticky top-0 z-50 w-full border-b border-[#3a5a40]/20 dark:border-[#3a5a40]/30 bg-white/95 dark:bg-[#1b221b]/98 backdrop-blur-md px-4 sm:px-8 py-4 sm:py-5 shadow-lg shadow-[#344e41]/8 transition-colors">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 sm:gap-4">
             <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-[1rem] sm:rounded-[1.2rem] bg-[#3a5a40] shadow-2xl text-white">
               <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
             </div>
             <AnimatePresence mode="wait">
               <motion.h1
                 key={activeTab}
                 initial={{ opacity: 0, y: -6 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 6 }}
                 transition={{ duration: 0.18 }}
                 className="font-extrabold text-xl sm:text-2xl tracking-tighter text-[#344e41] dark:text-[#dad7cd] leading-none uppercase"
               >
                 {{ home: 'Dashboard', habits: 'Hábitos', tasks: 'Tareas', brain: 'Brain Dump', analytics: 'Estadísticas' }[activeTab]}
               </motion.h1>
             </AnimatePresence>
          </div>

          <nav className="hidden sm:flex items-center bg-[#dad7cd]/50 dark:bg-black/60 p-1.5 rounded-[2.5rem] border border-[#344e41]/10 backdrop-blur-md">
             {tabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button key={tab.id} onClick={() => handleTabChange(tab.id as TabId)} aria-label={`Ir a ${tab.label}`} aria-current={isActive ? 'page' : undefined} className={`relative flex items-center gap-0 md:gap-3 px-4 md:px-7 py-3.5 rounded-[2rem] text-sm font-black transition-all ${isActive ? 'text-white dark:text-[#a3b18a] z-10' : 'text-[#3a5a40] dark:text-[#588157] hover:text-[#344e41] dark:hover:text-[#dad7cd]'}`}>
                   {isActive && ( <motion.div layoutId="activeTabDesktop" className="absolute inset-0 bg-[#3a5a40] dark:bg-[#344e41] shadow-2xl rounded-[2rem]" transition={{ type: "spring", bounce: 0.1, duration: 0.7 }} /> )}
                   <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'scale-110' : ''}`} />
                   <span className="relative z-10 hidden md:block">{tab.label}</span>
                 </button>
               )
             })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} className="rounded-full hover:bg-[#dad7cd]/40 text-[#3a5a40]">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <div className="w-px h-6 bg-[#3a5a40]/15 dark:bg-[#a3b18a]/15 mx-1" aria-hidden="true" />
            <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Cerrar sesión" className="rounded-full text-red-500/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"> <LogOut className="h-5 w-5" /> </Button>
          </div>
        </div>
      </header>

      {/* BOTTOM NAV FOR MOBILE */}
      <nav className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-sm bg-white/92 dark:bg-[#1b221b]/97 backdrop-blur-xl border border-[#3a5a40]/15 dark:border-[#3a5a40]/25 rounded-[2.5rem] p-1.5 shadow-[0_20px_60px_-12px_rgba(58,90,64,0.25)] flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id as TabId)} aria-label={`Ir a ${tab.label}`} aria-current={isActive ? 'page' : undefined} className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-14 rounded-[2rem] transition-colors duration-200 ${isActive ? 'text-[#3a5a40] dark:text-[#a3b18a]' : 'text-[#3a5a40]/45 dark:text-[#588157]/60'}`}>
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-x-0.5 inset-y-0.5 rounded-[1.7rem] bg-[#3a5a40]/10 dark:bg-[#3a5a40]/20"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-95'}`} />
              <span className="relative z-10 text-[10px] font-black uppercase tracking-tighter leading-none">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="max-w-[1600px] mx-auto flex flex-col gap-12 mt-10 sm:mt-12 px-4 sm:px-6 lg:px-10 relative z-10 w-full mb-12">

        <AnimatePresence mode="wait" custom={direction}>
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <DashboardSkeleton view={activeTab} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              
              {/* DASHBOARD: CALENDARIO */}
              {activeTab === 'home' && (
                 <PlannerView />
              )}

              {/* HABITS: CENTRO DE GESTIÓN */}
              {activeTab === 'habits' && (
                 <div className="flex flex-col gap-10 w-full">
                    <HabitsView />
                    
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
                        <CardContent className="p-4 sm:p-10 bg-white dark:bg-[#0a0f0a]/50 flex flex-col gap-6 sm:gap-10">
                           <div className="overflow-x-auto pb-4">
                              <GlobalHeatmap />
                           </div>
                           <div className="overflow-x-auto pb-4">
                              <MoodHeatmap />
                           </div>
                        </CardContent>
                     </Card>
                 </div>
              )}

               {/* BRAIN DUMP */}
               {activeTab === 'brain' && <BrainDump />}

               {/* TAREAS */}
               {activeTab === 'tasks' && <TaskSection />}

              {/* ESTADÍSTICAS */}
              {activeTab === 'analytics' && (
                 <div className="flex flex-col gap-10">

                    {/* Header */}
                    <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
                       <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-6 sm:px-12 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
                         <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                         <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter flex items-center gap-3 sm:gap-4 uppercase relative z-10">
                            <LayoutDashboard className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" /> Evolución
                         </h2>
                         <span className="relative z-10 w-fit px-4 sm:px-5 py-2 bg-white/10 border border-white/10 rounded-[2rem] text-[10px] sm:text-[11px] font-black uppercase text-white/80 tracking-widest">
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
                               <p className="text-[10px] sm:text-[11px] font-black text-[#3a5a40] dark:text-[#a3b18a] uppercase tracking-widest opacity-70">Hábitos</p>
                               <h4 className="text-4xl sm:text-5xl font-black text-[#283618] dark:text-[#dad7cd] leading-none mt-1">{habits.length}</h4>
                             </div>
                          </div>
                          {/* Stat: Días */}
                          <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-[#a47148]/5 border-2 border-[#a47148]/10 dark:border-[#a47148]/20 group hover:border-[#a47148]/30 transition-all">
                            <div className="w-14 h-14 bg-[#a47148]/10 rounded-[1.2rem] flex items-center justify-center flex-shrink-0">
                              <Flame className="w-7 h-7 text-[#a47148]" />
                            </div>
                             <div>
                               <p className="text-[10px] sm:text-[11px] font-black text-[#a47148] uppercase tracking-widest opacity-70">Días completados</p>
                               <h4 className="text-4xl sm:text-5xl font-black text-[#283618] dark:text-[#dad7cd] leading-none mt-1">{habitLogs.length}</h4>
                             </div>
                          </div>
                          {/* Stat: Notas */}
                          <div className="flex items-center gap-5 p-6 rounded-[1.5rem] bg-[#588157]/5 border-2 border-[#588157]/10 dark:border-[#588157]/20 group hover:border-[#588157]/30 transition-all">
                            <div className="w-14 h-14 bg-[#588157]/10 rounded-[1.2rem] flex items-center justify-center flex-shrink-0">
                              <Brain className="w-7 h-7 text-[#588157]" />
                            </div>
                             <div>
                               <p className="text-[10px] sm:text-[11px] font-black text-[#588157] uppercase tracking-widest opacity-70">Ideas Registradas</p>
                               <h4 className="text-4xl sm:text-5xl font-black text-[#283618] dark:text-[#dad7cd] leading-none mt-1">{notes.length}</h4>
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

      </div>

      <Toast />
    </main>
  );
}
