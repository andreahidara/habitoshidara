# Crear un nuevo componente

Pasos y plantilla para añadir un componente React a mi-habit-tracker.

## Cuándo crear un componente nuevo vs editar uno existente
- **Nuevo**: lógica o sección visual reutilizable o con más de ~80 líneas
- **Editar**: pequeño cambio en un componente existente que no justifica extracción

## Plantilla base

```tsx
"use client"

import React, { useState, useMemo } from 'react'
import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
// Añadir solo los imports que se usen

interface MiComponenteProps {
  // props tipadas aquí
}

export function MiComponente({ }: MiComponenteProps) {
  const { } = useStore()

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* contenido */}
    </div>
  )
}
```

## Checklist antes de añadir el componente

- [ ] `"use client"` en la primera línea si usa hooks o eventos
- [ ] Export nombrado (`export function X`), NO export default
- [ ] Props tipadas con interface (no `any`)
- [ ] `useMemo` para cálculos derivados del store (listas filtradas, estadísticas)
- [ ] Estado de carga/pendiente si hay operaciones async
- [ ] Estado vacío visible si renderiza una lista
- [ ] `aria-label` en todos los botones icono

## Dónde importarlo

Si es un tab completo → importar en `app/page.tsx` con lazy loading:
```tsx
const MiComponente = dynamicImport(
  () => import('@/components/MiComponente').then(mod => mod.MiComponente)
)
```

Si es un sub-componente → importar directamente en el componente padre.

## Componentes UI disponibles (shadcn)
```
components/ui/button.tsx    → <Button variant="ghost|default" size="icon|sm|default">
components/ui/card.tsx      → <Card> <CardContent> <CardHeader> <CardTitle>
components/ui/dialog.tsx    → <Dialog> <DialogContent> <DialogHeader> <DialogTitle> <DialogFooter>
components/ui/input.tsx     → <Input>
components/ui/textarea.tsx  → <Textarea>
```

## Heatmap (GitHub-style)
Para mostrar actividad histórica: ver `HabitHeatmap.tsx`, `MoodHeatmap.tsx`, `GlobalHeatmap.tsx`, `EventHeatmap.tsx`.
Todos usan `react-activity-calendar` bajo el capó.
