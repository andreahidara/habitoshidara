"use client"

import { useState } from "react"
import { useStore } from "@/store/useStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Leaf } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function AuthScreen() {
  const { signIn, signUp } = useStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      setLoading(false)
      return
    }

    const res = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password)
      
    if (res.error) {
      setError(res.error)
    } else {
      if(!isLogin) {
        setError("Bóveda creada. Revisa tu email o intenta iniciar sesión directamente de la misma forma.")
        setIsLogin(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex selection:bg-[#3a5a40]/30 selection:text-[#283618] bg-[#e9e0d8] dark:bg-[#0a0f0a]">
      
      {/* PANEL IZQUIERDO: Branding & Inspiración */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 bg-[#3a5a40]/5 dark:bg-[#1b221b] relative overflow-hidden transition-colors border-r border-[#3a5a40]/10 dark:border-white/5">
        
        {/* Adornos flotantes */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#3a5a40]/10 dark:bg-[#344e41]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#a47148]/10 dark:bg-[#a47148]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-5 bg-white dark:bg-[#1b221b] rounded-[2rem] shadow-2xl shadow-[#3a5a40]/10 border-2 border-[#3a5a40]/10 mb-10"
          >
            <Leaf className="w-10 h-10 text-[#3a5a40]" />
          </motion.div>
          <h1 className="text-5xl xl:text-7xl font-black tracking-tighter text-[#283618] dark:text-[#dad7cd] leading-[0.9] mb-8 uppercase">
            Cultiva tus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3a5a40] to-[#a47148]">Propósitos.</span>
          </h1>
          <p className="text-2xl text-[#3a5a40]/70 dark:text-[#a3b18a]/70 max-w-lg leading-tight font-bold italic">
            &quot;Donde la disciplina se encuentra con la naturaleza. Un refugio digital para tu crecimiento diario.&quot;
          </p>
        </div>

        <div className="z-10 relative flex items-center gap-4 text-[#3a5a40] dark:text-[#588157] font-black uppercase tracking-widest text-xs px-2 opacity-40">
           <ShieldCheck className="w-5 h-5" /> 
           <span>Bóveda Personal Blindada • Supabase RLS</span>
        </div>
      </div>

      {/* PANEL DERECHO: Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        <div className="w-full max-w-[440px] flex flex-col relative z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="flex flex-col gap-8"
            >
              
              <div className="text-center sm:text-left mb-2">
                <h2 className="text-5xl font-black text-[#283618] dark:text-white tracking-tighter uppercase leading-none flex items-center justify-center sm:justify-start gap-4">
                   {isLogin ? "Bienvenido" : "Inicia"}
                   {!isLogin && <Sparkles className="w-8 h-8 text-[#a47148]" />}
                </h2>
                <p className="text-[#3a5a40] mt-4 font-bold text-xl opacity-60">
                  {isLogin 
                    ? "Accede a tu centro de control personal." 
                    : "Forja hoy la estructura de tu mañana."}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-5 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-[1.5rem] text-sm font-black uppercase tracking-wider shadow-inner"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-3 group">
                  <label className="text-xs font-black text-[#3a5a40] dark:text-[#a3b18a] uppercase tracking-widest ml-4 opacity-60">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#3a5a40] group-focus-within:text-[#a47148] transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <Input 
                      type="email" 
                      placeholder="tucorreo@ejemplo.com"
                      value={email} onChange={e => setEmail(e.target.value)} required 
                      className="py-8 pl-16 bg-white dark:bg-[#1b221b] border-2 border-[#3a5a40]/10 focus:border-[#3a5a40] rounded-[2rem] text-xl font-bold shadow-xl transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 group">
                  <label className="text-xs font-black text-[#3a5a40] dark:text-[#a3b18a] uppercase tracking-widest ml-4 opacity-60">Llave Maestra</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#3a5a40] group-focus-within:text-[#a47148] transition-colors">
                      <Lock className="w-6 h-6" />
                    </div>
                    <Input 
                      type="password" 
                      placeholder="6+ caracteres confidenciales"
                      value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                      className="py-8 pl-16 bg-white dark:bg-[#1b221b] border-2 border-[#3a5a40]/10 focus:border-[#3a5a40] rounded-[2rem] text-xl font-bold shadow-xl transition-all outline-none"
                    />
                  </div>
                </div>

                <Button disabled={loading} type="submit" className="w-full mt-4 bg-[#3a5a40] hover:bg-[#283618] text-white font-black text-2xl h-20 shadow-4xl shadow-[#3a5a40]/30 rounded-[2rem] transition-all group relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-tighter">
                     {loading ? "Sincronizando..." : (isLogin ? "Entrar al Dashboard" : "Forjar Bóveda")}
                     {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                </Button>
                
              </form>

              <div className="mt-6 pt-8 border-t-2 border-[#3a5a40]/10 dark:border-white/5 text-center">
                <p className="text-[#3a5a40] dark:text-[#a3b18a] font-bold text-lg">
                  {isLogin ? "¿Nuevo en el sistema?" : "¿Ya tienes tu base?"}
                  <button 
                    type="button" 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="ml-3 text-[#a47148] font-black hover:underline underline-offset-8 uppercase tracking-tighter"
                  >
                    {isLogin ? "Regístrate" : "Acceder"}
                  </button>
                </p>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
