# 🎯 Mi Habit Tracker

Un sitio web hiper-personalizado y profesional para rastrear tus tareas diarias, construir buenos hábitos, y visualizar tu progreso a lo largo del tiempo.

## 🚀 Características Principales

- **Dashboard Unificado**: Una interfaz estilo Bento-Box que agrupa todo tu ecosistema de productividad.
- **Gráficos de Contribución (Heatmap)**: Visualización inspirada en GitHub de la consistencia de cada hábito en los últimos meses.
- **Calendario Interactivo**: Un `FullCalendar` integrado gigante donde al hacer clic en cualquier día, un diálogo de Shadcn permite añadir notas y eventos.
- **Dark Mode**: Soporte nativo para modo oscuro con un solo clic.
- **Persistencia Asíncrona (Supabase)**: Usa `Zustand` para manejar todo el estado y se comunica transparentemente con una base de datos PostgreSQL de Supabase.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Botones, Checkboxes, Dialogos, etc.)
- **Calendario**: [@fullcalendar/react](https://fullcalendar.io/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/)
- **Base de Datos**: [Supabase](https://supabase.com/) & PostgreSQL
- **Fechas**: `date-fns`
- **Iconos**: `lucide-react`

## ⚙️ Configuración Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura tu Base de Datos:
   - Crea un proyecto en [Supabase](https://supabase.com).
   - Ve a la pestaña de `SQL Editor` y ejecuta todo el código que se encuentra en `supabase-schema.sql`.

3. Variables de Entorno:
   - Crea un archivo `.env.local` en la raíz del proyecto.
   - Pega tu URL y tu Anon Key como indica el archivo:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="tu_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_anon_key"
   ```

4. Corre el proyecto:
   ```bash
   npm run dev
   ```
   > Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la app funcionando.
