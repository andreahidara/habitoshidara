# Mejorar la interfaz de usuario

Guía para proponer y aplicar mejoras visuales en mi-habit-tracker sin romper la consistencia del diseño.

## Antes de tocar la UI

1. **Identifica el componente exacto** — lee el archivo antes de editar
2. **Mantén la paleta** — NUNCA cambies los colores base sin que la usuaria lo pida explícitamente
3. **Respeta el estilo tipográfico** — `font-black tracking-tighter uppercase` para títulos, `font-bold` para cuerpo
4. **Mantén los border-radius grandes** — `rounded-[2rem]`, `rounded-[1.5rem]`, nunca `rounded-md` suelto

## Paleta (referencia rápida)
```
Primary:  #3a5a40   Accent: #a47148
Light 2:  #588157   BG:     #e9e0d8
Card:     #ffffff   Text:   #283618

Dark equivalents:
Card:     #1b221b   BG:     #0a0f0a
Text:     #dad7cd   Primary soft: #a3b18a
```

## Patrones de mejora UX frecuentes

### Añadir estado vacío con ilustración
```tsx
<div className="flex flex-col items-center justify-center p-16 text-center border-4 border-dashed border-[#3a5a40]/20 rounded-[3rem] bg-[#3a5a40]/5">
  <div className="w-24 h-24 bg-[#3a5a40]/10 rounded-full flex items-center justify-center mb-6">
    <IconName className="w-12 h-12 text-[#3a5a40]" />
  </div>
  <h3 className="text-3xl font-black text-[#283618] dark:text-[#dad7cd] mb-4 uppercase tracking-tighter">
    Estado vacío
  </h3>
  <p className="text-xl text-[#344e41]/70 dark:text-[#a3b18a] max-w-md font-bold">
    Mensaje de ayuda.
  </p>
</div>
```

### Añadir skeleton/loading
- Ver `components/DashboardSkeleton.tsx` para el patrón
- Usar `animate-pulse bg-[#3a5a40]/10 rounded-[1rem]` para los bloques

### Header de sección (gradiente verde)
```tsx
<div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-6 sm:px-12 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden border-b-[6px] border-[#a47148]/20">
  <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter flex items-center gap-3 sm:gap-4 uppercase relative z-10">
    <IconName className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" /> Título
  </h2>
  <span className="relative z-10 px-4 sm:px-5 py-2 bg-white/10 border border-white/10 rounded-[2rem] text-[11px] font-black uppercase text-white/80 tracking-widest">
    Subtítulo / badge
  </span>
</div>
```

### Badge/chip de estado
```tsx
<span className="px-3 py-1.5 rounded-lg bg-[#3a5a40]/10 border border-[#3a5a40]/20 text-[10px] font-black uppercase tracking-widest text-[#3a5a40]">
  Estado
</span>
```

### Botón primario (ya existe como clase)
```tsx
<Button className="btn-primary h-14 shadow-lg shadow-[#3a5a40]/20">
  Acción
</Button>
```

## Animaciones con Framer Motion

### Entrada de lista (stagger)
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.3 } }
}
// Usar: <motion.div variants={containerVariants}> con hijos <motion.div variants={itemVariants}>
```

### Micro-interacción en botón
```tsx
<motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}>
```

### Fade simple
```tsx
<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
```

## Mejoras de accesibilidad mínimas
- Todo botón icono necesita `aria-label`
- Botones toggle necesitan `aria-pressed`
- Inputs necesitan `id` + `<label htmlFor>`
- Verificar contraste: texto sobre fondo verde (#3a5a40) debe ser blanco

## Qué NO hacer
- No usar clases de color de Tailwind genéricas (`green-500`, `blue-400`) — usar hex del sistema
- No añadir `box-shadow` custom vía style inline — usar las clases de Tailwind (`shadow-2xl`)
- No usar `fixed` para elementos de contenido (solo para nav y toasts)
- No romper el responsive: siempre `sm:` para variantes de escritorio
