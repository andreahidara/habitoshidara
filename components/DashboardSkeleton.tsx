"use client"

import React from 'react'
import { motion, type Variants } from "framer-motion"

const pulseVariants: Variants = {
  initial: { opacity: 0.3 },
  animate: { opacity: 0.6, transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const } }
}

function SkeletonItem({ height = "h-40", className = "" }) {
  return (
    <motion.div
      variants={pulseVariants}
      initial="initial"
      animate="animate"
      className={`${height} ${className} bg-slate-200 dark:bg-slate-800 rounded-[2rem] w-full`}
    />
  )
}

export function DashboardSkeleton({ view = 'home' }: { view: 'home' | 'habits' | 'brain' | 'analytics' | 'tasks' }) {
  if (view === 'tasks') {
    return (
      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
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
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-2/3 flex flex-col gap-4">
           <SkeletonItem height="h-10" className="w-1/3 mb-4" />
           <SkeletonItem height="h-[500px]" />
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-6">
           <SkeletonItem height="h-10" className="w-1/2 mb-4" />
           <SkeletonItem height="h-64" />
           <SkeletonItem height="h-32" />
        </div>
      </div>
    )
  }

  if (view === 'habits') {
    return (
      <div className="flex flex-col gap-8 w-full">
        <SkeletonItem height="h-12" className="w-1/4 mb-4" />
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
      <div className="flex flex-col gap-8 w-full">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-[500px]">
       <SkeletonItem height="h-full" />
       <SkeletonItem height="h-full" />
    </div>
  )
}
