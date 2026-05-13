# mi-habit-tracker — Guía para Claude Code

## Qué es esta app
Habit tracker personal full-stack. Next.js 16 + React 19, Supabase como backend/auth, Zustand para estado global. PWA con service worker. Deploy en Vercel.

## Stack
| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Animaciones | Framer Motion |
| Estado | Zustand v5 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Calendario | FullCalendar v6 |
| Gráficos | Recharts |
| Tests | Vitest + Testing Library |
| Iconos | Lucide React |

## Paleta de colores (NO cambiar sin pedirlo)
```
Primary:    #3a5a40  (verde musgo profundo)
Primary 2:  #588157  (verde musgo claro)
Accent:     #a47148  (barro/terracota)
BG light:   #e9e0d8  (lino)
BG dark:    #0a0f0a
Card light: #ffffff
Card dark:  #1b221b
Text light: #283618  (bosque negro)
Text dark:  #dad7cd
```

## Arquitectura
```
app/
  page.tsx          ← Shell principal: tabs, nav, auth guard
  layout.tsx        ← ThemeProvider, metadata
  providers.tsx     ← Registra SW, wrappers globales
components/
  HabitsView.tsx    ← Tab hábitos (lista + formulario + mood)
  HabitCard.tsx     ← Card individual de hábito (drag-to-complete)
  TaskSection.tsx   ← Tab tareas (prioridades, completar, limpiar)
  BrainDump.tsx     ← Tab notas (crear, buscar, borrar)
  PlannerView.tsx   ← Tab home (FullCalendar + heatmap eventos)
  AnalyticsDashboard.tsx ← Tab estadísticas (gráfico semanal)
  MoodSelector.tsx  ← Selector de ánimo diario
  *Heatmap.tsx      ← Componentes de heatmap (GitHub-style)
  ui/               ← Componentes shadcn (button, card, dialog…)
store/
  useStore.ts       ← Todo el estado + acciones Supabase
lib/
  supabase.ts       ← Cliente Supabase
  utils.ts          ← cn(), calculateStreak()
  constants.ts      ← MOODS
```

## Tablas Supabase
| Tabla | Campos relevantes |
|-------|-------------------|
| `habits` | id, user_id, name, description, icon |
| `habit_logs` | id, user_id, habit_id, completed_date |
| `tasks` | id, user_id, title, priority, is_completed, created_at |
| `notes` | id, user_id, content, created_at |
| `events` | id, user_id, title, date, all_day |
| `mood_logs` | id, user_id, mood, date |

## Reglas de desarrollo

- **Optimistic updates siempre**: actualizar estado local primero, revertir si falla DB. Ver `/add-store-action`.
- **Pending state en toggles**: usar `Set<string>` de IDs pendientes para evitar doble-click. Ver `HabitsView.tsx` y `TaskSection.tsx`.
- **Locale español**: todas las fechas con `{ locale: es }` de `date-fns/locale`. FullCalendar con `esLocale`.
- **Validación de inputs**: máximo de caracteres con `slice()` en `onChange` + contador visible + `disabled` en botón.
- **No confirmar al eliminar**: solo hábitos y eventos tienen diálogo de confirmación (tienen historial). Notas y tareas se borran directo.
- **Clases Tailwind hardcodeadas**: no usar variables CSS custom para colores, usar hex directamente con opacity (`#3a5a40/20`).

## Comandos útiles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm test             # Tests unitarios (vitest)
npm run test:watch   # Tests en watch mode
npx tsc --noEmit     # Verificar tipos TypeScript
```

## Skills disponibles (slash commands)
- `/add-store-action` — Patrón para nueva acción Zustand+Supabase
- `/new-tab` — Añadir nueva pestaña a la app
- `/add-component` — Crear nuevo componente siguiendo el diseño
- `/improve-ui` — Guía de mejoras de interfaz y patrones visuales
- `/supabase-table` — Añadir nueva tabla con migraciones y tipos
- `/check-types` — Verificar TypeScript
- `/run-tests` — Ejecutar tests

## Agentes disponibles (sub-agentes especializados)
- `ui-reviewer` — Audita componentes: accesibilidad, consistencia visual, dark mode, estados vacíos
- `feature-builder` — Construye features completas (store + componente + integración)
- `test-writer` — Escribe tests Vitest para utilidades y lógica del store
- `perf-auditor` — Detecta re-renders innecesarios, useMemo faltantes, suscripciones al store pesadas
- `db-architect` — Diseña esquemas Supabase y genera SQL listo para ejecutar
- `security-reviewer` — Audita auth, RLS, variables de entorno, CSP, XSS, Service Worker
- `seo-pwa-optimizer` — Mejora metadata OG, manifest PWA, robots.txt, viewport
- `cleanup-optimizer` — Elimina imports muertos, tipos duplicados, código comentado, console.logs
