# Añadir acción al store (Zustand + Supabase)

Cuando el usuario pida añadir una nueva acción de datos, sigue este patrón establecido en el proyecto.

## Patrón optimistic update

```typescript
// 1. Tipo en el interface AppState
addThing: (data: Omit<Thing, 'id'>) => Promise<void>;
deleteThing: (id: string) => Promise<void>;

// 2. Implementación
addThing: async (data) => {
  const user = get().user;
  if (!user) return;
  const tid = tempId();
  const tempThing: Thing = { ...data, id: tid };
  set((s) => ({ things: [...s.things, tempThing] }));
  const { data: res, error } = await supabase
    .from('things')
    .insert([{ ...data, user_id: user.id }])
    .select();
  if (!error && res) {
    set((s) => ({ things: s.things.map(t => t.id === tid ? res[0] : t) }));
  } else {
    set((s) => ({ things: s.things.filter(t => t.id !== tid) }));
    get().showToast(`Error al guardar: ${error?.message}`, 'error');
  }
},

deleteThing: async (id) => {
  const itemToDelete = get().things.find(t => t.id === id);
  set((s) => ({ things: s.things.filter(t => t.id !== id) }));
  const { error } = await supabase.from('things').delete().eq('id', id);
  if (error) {
    if (itemToDelete) set((s) => ({ things: [...s.things, itemToDelete] }));
    get().showToast(`Error al eliminar: ${error.message}`, 'error');
  }
},
```

## Checklist
- [ ] Añadir tipo TypeScript en la sección de tipos del store
- [ ] Añadir al interface `AppState`
- [ ] Inicializar el array en el estado inicial (`things: []`)
- [ ] Añadir a `fetchData` con `supabase.from('things').select('*').eq('user_id', user.id)`
- [ ] Incluir en el `set({})` del `fetchData`
- [ ] Limpiar en `onAuthStateChange` cuando el usuario cierra sesión

## Pending state anti-double-click
Si la acción es toggleable (como hábitos o tareas), usar `Set<string>` de IDs pendientes:
```typescript
const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
const handle = async (id: string) => {
  if (pendingIds.has(id)) return
  setPendingIds(prev => new Set(prev).add(id))
  try { await storeAction(id) }
  finally { setPendingIds(prev => { const n = new Set(prev); n.delete(id); return n }) }
}
```
