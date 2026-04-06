# 🌿 Mi Habit Tracker

Una aplicación web premium para construir hábitos, gestionar tu día y visualizar tu progreso anual. Diseño exclusivo **Moss/Clay** con soporte completo de modo oscuro.

---

## ✨ Características Principales

- **🗓️ Planificador** — Calendario interactivo (FullCalendar) donde puedes añadir y gestionar eventos con un clic.
- **🎯 Hábitos Diarios** — Crea, completa (deslizando o haciendo clic) y elimina hábitos. Incluye racha, mini-heatmap por hábito y confeti al completar.
- **😊 Mood Tracker** — Registra tu estado de ánimo diario y actualízalo cuando quieras.
- **🧠 Brain Dump** — Captura ideas y pensamientos rápidamente. Búsqueda en tiempo real, rejilla de notas con animaciones.
- **📊 Estadísticas** — Métricas globales, gráfico de rendimiento semanal y heatmaps anuales de disciplina y energía.
- **🌙 Dark Mode** — Soporte nativo instantáneo.
- **🔐 Autenticación** — Login/Registro con Supabase Auth + Row Level Security.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI | [shadcn/ui](https://ui.shadcn.com/) |
| Calendario | [@fullcalendar/react](https://fullcalendar.io/) |
| Gráficos | [Recharts](https://recharts.org/) + [react-activity-calendar](https://www.npmjs.com/package/react-activity-calendar) |
| Estado | [Zustand](https://docs.pmnd.rs/zustand/) |
| Base de Datos | [Supabase](https://supabase.com/) (PostgreSQL + RLS) |
| Animaciones | [Framer Motion](https://www.framer.com/motion/) |
| Iconos | [Lucide React](https://lucide.dev/) |

---

## ⚙️ Configuración Local

### 1. Clona e instala dependencias
```bash
git clone https://github.com/andreahidara/mi-habit-tracker.git
cd mi-habit-tracker
npm install
```

### 2. Configura Supabase
- Crea un proyecto en [supabase.com](https://supabase.com).
- Ve al `SQL Editor` y ejecuta el contenido del archivo **`setup-full-v4.sql`** para crear las tablas y políticas RLS.

### 3. Variables de entorno
Crea un archivo `.env.local` en la raíz:
```env
NEXT_PUBLIC_SUPABASE_URL="tu_url_de_supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_anon_key_de_supabase"
```

### 4. Arranca el servidor
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
mi-habit-tracker/
├── app/
│   ├── page.tsx          # Página principal (todas las pestañas)
│   ├── globals.css       # Estilos globales y paleta Moss/Clay
│   └── providers.tsx     # Theme provider
├── components/
│   ├── AuthScreen.tsx    # Pantalla de login/registro
│   ├── BrainDump.tsx     # Módulo de notas
│   ├── AnalyticsDashboard.tsx  # Gráfico semanal
│   ├── GlobalHeatmap.tsx # Heatmap anual de hábitos
│   ├── MoodHeatmap.tsx   # Heatmap anual de energía
│   ├── EventHeatmap.tsx  # Heatmap de eventos
│   ├── MoodSelector.tsx  # Selector de estado de ánimo
│   └── HabitHeatmap.tsx  # Mini heatmap por hábito
├── store/
│   └── useStore.ts       # Estado global con Zustand + Supabase
└── lib/
    └── supabase.ts       # Cliente de Supabase
```
