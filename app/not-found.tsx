import Link from "next/link"
import { Leaf } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#e9e0d8] dark:bg-[#0a0f0a] flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center gap-8 max-w-md">

        <div className="w-24 h-24 rounded-[2rem] bg-[#3a5a40] flex items-center justify-center shadow-2xl shadow-[#3a5a40]/30">
          <Leaf className="w-12 h-12 text-white" />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[#3a5a40]/40 dark:text-[#a3b18a]/40 font-black text-sm uppercase tracking-[0.3em]">
            Error 404
          </p>
          <h1 className="text-5xl sm:text-7xl font-black text-[#283618] dark:text-[#dad7cd] tracking-tighter uppercase leading-none">
            Página no encontrada
          </h1>
          <p className="text-[#344e41]/60 dark:text-[#a3b18a]/60 font-bold text-lg mt-2">
            Esta ruta no existe en tu jardín digital.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 px-8 py-4 bg-[#3a5a40] hover:bg-[#283618] text-white font-black text-sm uppercase tracking-widest rounded-[2rem] shadow-xl shadow-[#3a5a40]/20 transition-colors"
        >
          <Leaf className="w-4 h-4" />
          Volver al Dashboard
        </Link>

      </div>
    </main>
  )
}
