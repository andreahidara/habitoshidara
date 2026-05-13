# Verificar tipos TypeScript del proyecto

Ejecuta una verificación de tipos sin compilar y muestra los errores.

```bash
npx tsc --noEmit
```

Luego revisa en este orden:
1. Errores en `store/useStore.ts` — tipos del estado y acciones
2. Errores en `components/` — props mal tipadas
3. Errores en `lib/` — utilidades

## Tipos clave del proyecto

| Entidad | Tabla Supabase | Tipo TS |
|---------|---------------|---------|
| Hábito | `habits` | `Habit` |
| Log de hábito | `habit_logs` | `HabitLog` |
| Tarea | `tasks` | `Task` |
| Nota | `notes` | `Note` |
| Evento | `events` | `Event` |
| Estado ánimo | `mood_logs` | `MoodLog` |

Todos los tipos están en `store/useStore.ts`. Si Supabase añade o cambia columnas, actualizar los tipos ahí primero.

## Notas
- `TaskPriority = 'high' | 'medium' | 'low'` — siempre usar esta unión, no strings libres
- `tempId()` genera IDs temporales con prefijo `optimistic-` para distinguirlos de IDs reales de Supabase
- El campo `user_id` se omite en los tipos frontend (lo añade el store al insertar)
