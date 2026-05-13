# Ejecutar tests del proyecto

## Tests disponibles

```bash
# Ejecutar una vez
npm test

# Watch mode (re-ejecuta al guardar)
npm run test:watch
```

## Estructura de tests

- `__tests__/utils.test.ts` — Tests de `calculateStreak` (9 casos incluyendo regresión de timezone)
- Configuración: `vitest.config.ts` + `vitest.setup.ts`

## Antes de añadir un test nuevo

1. Los tests van en `__tests__/` con el nombre `<modulo>.test.ts`
2. Usar `describe` + `it` de vitest
3. Para tests de componentes React, usar `@testing-library/react`
4. Para mocks de Supabase, usar `vi.mock('@/lib/supabase')`

## Regresión crítica a mantener

`calculateStreak` debe pasar el test de timezone:
```typescript
it('cuenta hoy si el log es de hoy (sin desfase UTC)', () => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = new Set([today])
  expect(calculateStreak(set)).toBe(1)
})
```

Si este test falla, hay un bug de timezone — revisar que `calculateStreak` use `startOfDay(new Date())` y no `new Date(dateString)`.
