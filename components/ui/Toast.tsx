"use client"

import React from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, X } from "lucide-react"
import { useStore } from "@/store/useStore"

export function Toast() {
  const { toast, clearToast } = useStore()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
          className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-4 rounded-[2rem] shadow-2xl border font-black text-sm uppercase tracking-widest whitespace-nowrap ${
            toast.type === 'error'
              ? 'bg-white dark:bg-[#1b221b] border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 shadow-red-100 dark:shadow-red-900/20'
              : 'bg-[#3a5a40] border-[#3a5a40] text-white shadow-[#3a5a40]/30'
          }`}
        >
          {toast.type === 'error'
            ? <XCircle className="w-5 h-5 flex-shrink-0" />
            : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          }
          <span>{toast.message}</span>
          <button
            onClick={clearToast}
            aria-label="Cerrar notificación"
            className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
