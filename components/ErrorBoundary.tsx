"use client"

import React from "react"
import { Leaf, RefreshCw } from "lucide-react"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-8 p-12 rounded-[2.5rem] border-2 border-dashed border-[#3a5a40]/20 bg-[#3a5a40]/5 text-center">
          <div className="w-20 h-20 rounded-full bg-[#3a5a40]/10 flex items-center justify-center">
            <Leaf className="w-10 h-10 text-[#3a5a40] opacity-40" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-[#283618] dark:text-[#dad7cd] tracking-tighter uppercase">
              Algo salió mal
            </h2>
            <p className="text-sm font-bold text-[#3a5a40]/60 dark:text-[#a3b18a]/60 uppercase tracking-widest max-w-xs mx-auto">
              Esta sección tuvo un error inesperado
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-[#3a5a40] text-white font-black text-sm uppercase tracking-widest rounded-[2rem] hover:bg-[#283618] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
