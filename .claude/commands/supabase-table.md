# Añadir nueva tabla a Supabase

Flujo completo para incorporar una nueva entidad de datos a la app.

## 1. Crear la tabla en Supabase Dashboard

SQL a ejecutar en el Editor SQL de Supabase:

```sql
create table public.mi_tabla (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  -- tus columnas aquí
  created_at timestamptz default now() not null
);

-- Row Level Security (obligatorio)
alter table public.mi_tabla enable row level security;

create policy "usuarios solo ven sus propios datos"
  on public.mi_tabla
  for all
  using (auth.uid() = user_id);
```

## 2. Añadir el tipo TypeScript en `store/useStore.ts`

```typescript
type MiEntidad = {
  id: string;
  // resto de campos (sin user_id, lo maneja el store)
  created_at: string;
};
```

## 3. Añadir al interface AppState

```typescript
miEntidades: MiEntidad[];
addMiEntidad: (data: Omit<MiEntidad, 'id' | 'created_at'>) => Promise<void>;
deleteMiEntidad: (id: string) => Promise<void>;
```

## 4. Añadir al estado inicial

```typescript
miEntidades: [],
```

## 5. Añadir a fetchData

```typescript
const miEntidadesRes = await supabase
  .from('mi_tabla')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// En el set({}) del fetchData:
miEntidades: miEntidadesRes.data || [],
```

Nota: añadir `'mi_tabla'` al array `tableNames` para el log de errores.

## 6. Limpiar al cerrar sesión

En `onAuthStateChange`:
```typescript
else set({ events: [], habits: [], ..., miEntidades: [] });
```

## 7. Implementar las acciones

Seguir el patrón en `/add-store-action`.

## Verificación final
```bash
npx tsc --noEmit   # Sin errores de tipos
npm test           # Tests siguen pasando
```
