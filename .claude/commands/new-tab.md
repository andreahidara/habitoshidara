# Añadir nueva pestaña a la app

Pasos para añadir un nuevo tab/sección a `mi-habit-tracker`.

## 1. Registrar el tab en `app/page.tsx`

```typescript
// Añadir al type
type TabId = 'home' | 'habits' | 'tasks' | 'brain' | 'analytics' | 'nuevo';

// Añadir al array TAB_ORDER
const TAB_ORDER: TabId[] = ['home', 'habits', 'tasks', 'brain', 'analytics', 'nuevo'];

// Añadir al array tabs (con icono de lucide-react)
{ id: 'nuevo', label: 'Nuevo', icon: IconName },

// Añadir el bloque de renderizado dentro de <motion.div>
{activeTab === 'nuevo' && (
  <div>
    <h2 className="text-5xl font-black text-[#283618] dark:text-[#fefae0] mb-14 tracking-tighter uppercase">
      Título
    </h2>
    <NuevoComponente />
  </div>
)}
```

## 2. Importar el componente con lazy loading

```typescript
const NuevoComponente = dynamicImport(
  () => import('@/components/NuevoComponente').then(mod => mod.NuevoComponente)
);
```

## 3. Crear el componente en `components/NuevoComponente.tsx`

Estructura base:
```typescript
"use client"
import React from 'react'
import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"

export function NuevoComponente() {
  const { } = useStore()
  return (
    <div className="flex flex-col gap-10 w-full">
      <Card className="card-base border-t-0 p-0 overflow-hidden shadow-2xl shadow-[#3a5a40]/10">
        <div className="bg-gradient-to-r from-[#3a5a40] to-[#588157] dark:from-[#1b221b] dark:to-[#283618] px-6 sm:px-12 py-6 sm:py-8 border-b-[6px] border-[#a47148]/20">
          {/* Header */}
        </div>
        <CardContent className="p-6 sm:p-10 bg-white dark:bg-[#0a0f0a]/50">
          {/* Contenido */}
        </CardContent>
      </Card>
    </div>
  )
}
```

## 4. Añadir al DashboardSkeleton si es necesario

En `components/DashboardSkeleton.tsx`, añadir el caso para el nuevo tab en el `switch`.

## Paleta de colores del proyecto
- Primary: `#3a5a40` / `#588157`
- Accent: `#a47148`
- Background: `#e9e0d8` (light) / `#0a0f0a` (dark)
- Text: `#283618` (light) / `#dad7cd` (dark)
- Cards: `white` / `#1b221b`
