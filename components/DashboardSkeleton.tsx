"use client"

import { motion, type Variants } from "framer-motion"

const pulseVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: { opacity: 0.7, transition: { duration: 1.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } }
}

function SkeletonItem({ height = "h-40", className = "" }: { height?: string; className?: string }) {
  return (
    <motion.div
      variants={pulseVariants}
      initial="initial"
      animate="animate"
      className={`${height} ${className} bg-[#dad7cd] dark:bg-[#344e41]/60 rounded-[2rem] w-full`}
    />
  )
}

export function DashboardSkeleton({ view = 'home' }: { view: 'home' | 'habits' | 'brain' | 'analytics' | 'tasks' }) {
  if (view === 'tasks') {
    return (
      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto" role="status" aria-label="Cargando tareas...">
        <SkeletonItem height="h-32" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonItem key={i} height="h-16" className="rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (view === 'home') {
    return (
      <div className="flex flex-col md:flex-row gap-6 w-full" role="status" aria-label="Cargando planificador...">
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <SkeletonItem height="h-10" className="w-1/3 mb-4 rounded-2xl" />
          <SkeletonItem height="h-[500px]" />
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <SkeletonItem height="h-10" className="w-1/2 mb-4 rounded-2xl" />
          <SkeletonItem height="h-64" />
          <SkeletonItem height="h-32" />
        </div>
      </div>
    )
  }

  if (view === 'habits') {
    return (
      <div className="flex flex-col gap-8 w-full" role="status" aria-label="Cargando hábitos...">
        <SkeletonItem height="h-48" className="rounded-[2rem]" />
        <SkeletonItem height="h-10" className="w-1/4 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonItem key={i} height="h-72" />
          ))}
        </div>
      </div>
    )
  }

  if (view === 'brain') {
    return (
      <div className="flex flex-col gap-8 w-full" role="status" aria-label="Cargando notas...">
        <SkeletonItem height="h-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonItem key={i} height="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-[500px]" role="status" aria-label="Cargando estadísticas...">
      <SkeletonItem height="h-full" />
      <SkeletonItem height="h-full" />
    </div>
  )
}
