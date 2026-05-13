import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useStore } from '../store/useStore'

// ---- Supabase mock -------------------------------------------------------
// Each builder call returns `this` so chains like .delete().eq().in() work.
// Individual methods are spied on so tests can override their resolved value.

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockIn = vi.fn()
const mockOrder = vi.fn()

// Default happy-path responses — overridden per test where needed
function resetMockDefaults() {
  mockSelect.mockResolvedValue({ data: [], error: null })
  mockInsert.mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{ id: 'real-id', title: 'Test task', priority: 'medium', is_completed: false, created_at: new Date().toISOString() }], error: null }) })
  mockUpdate.mockReturnValue({ eq: mockEq })
  mockDelete.mockReturnValue({ eq: mockEq, in: mockIn })
  mockEq.mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{ id: 'real-id', title: 'Test task', priority: 'medium', is_completed: true, created_at: new Date().toISOString() }], error: null }), eq: mockEq, in: mockIn })
  mockIn.mockResolvedValue({ error: null })
  mockOrder.mockReturnValue({ eq: mockEq })
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
      in: mockIn,
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

// ---- Helpers -------------------------------------------------------------

type Task = {
  id: string
  title: string
  is_completed: boolean
  priority: 'high' | 'medium' | 'low'
  created_at: string
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `task-${Math.random()}`,
    title: 'Sample task',
    is_completed: false,
    priority: 'medium',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

const fakeUser = { id: 'user-123' } as ReturnType<typeof useStore.getState>['user']

function resetStore(tasks: Task[] = []) {
  useStore.setState({ tasks, user: fakeUser, toast: null })
}

// ---- Tests ---------------------------------------------------------------

describe('clearCompletedTasks', () => {
  beforeEach(() => {
    resetMockDefaults()
  })

  it('removes only completed tasks from the store', async () => {
    const pending = makeTask({ id: 'pending-1', is_completed: false })
    const done1 = makeTask({ id: 'done-1', is_completed: true })
    const done2 = makeTask({ id: 'done-2', is_completed: true })
    resetStore([pending, done1, done2])

    await useStore.getState().clearCompletedTasks()

    const tasks = useStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('pending-1')
  })

  it('does nothing when there are no completed tasks', async () => {
    const pending = makeTask({ id: 'pending-1', is_completed: false })
    resetStore([pending])

    await useStore.getState().clearCompletedTasks()

    expect(useStore.getState().tasks).toHaveLength(1)
  })

  it('restores completed tasks and shows error toast if Supabase fails', async () => {
    const pending = makeTask({ id: 'pending-1', is_completed: false })
    const done = makeTask({ id: 'done-1', is_completed: true })
    resetStore([pending, done])

    mockIn.mockResolvedValueOnce({ error: { message: 'DB error' } })

    await useStore.getState().clearCompletedTasks()

    const tasks = useStore.getState().tasks
    // Both tasks should be back
    expect(tasks.some(t => t.id === 'done-1')).toBe(true)
    expect(tasks.some(t => t.id === 'pending-1')).toBe(true)
    expect(useStore.getState().toast).toMatchObject({ type: 'error' })
  })
})

describe('addTask (optimistic update)', () => {
  beforeEach(() => {
    resetMockDefaults()
  })

  it('adds a temporary optimistic entry before Supabase resolves', async () => {
    resetStore([])

    // Capture the state mid-flight with a deferred promise
    let resolveInsert!: (v: unknown) => void
    const insertPromise = new Promise(res => { resolveInsert = res })

    const selectAfterInsert = vi.fn().mockReturnValue(insertPromise)
    mockInsert.mockReturnValueOnce({ select: selectAfterInsert })

    const actionPromise = useStore.getState().addTask('Buy milk', 'high')

    // Before the promise resolves, the optimistic task should be in the store
    const tasksBeforeResolve = useStore.getState().tasks
    expect(tasksBeforeResolve).toHaveLength(1)
    expect(tasksBeforeResolve[0].title).toBe('Buy milk')
    expect(tasksBeforeResolve[0].id).toMatch(/^optimistic-/)

    // Resolve Supabase with a real ID
    const realTask = { id: 'real-db-id', title: 'Buy milk', priority: 'high', is_completed: false, created_at: new Date().toISOString() }
    resolveInsert({ data: [realTask], error: null })
    await actionPromise

    // The optimistic ID should be replaced by the real one
    const tasksAfterResolve = useStore.getState().tasks
    expect(tasksAfterResolve).toHaveLength(1)
    expect(tasksAfterResolve[0].id).toBe('real-db-id')
  })

  it('removes the optimistic task and shows error toast if Supabase fails', async () => {
    resetStore([])

    const selectAfterInsert = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    mockInsert.mockReturnValueOnce({ select: selectAfterInsert })

    await useStore.getState().addTask('Failing task')

    expect(useStore.getState().tasks).toHaveLength(0)
    expect(useStore.getState().toast).toMatchObject({ type: 'error' })
  })

  it('defaults priority to medium when not specified', async () => {
    resetStore([])

    const realTask = { id: 'real-db-id', title: 'No priority task', priority: 'medium', is_completed: false, created_at: new Date().toISOString() }
    const selectAfterInsert = vi.fn().mockResolvedValue({ data: [realTask], error: null })
    mockInsert.mockReturnValueOnce({ select: selectAfterInsert })

    await useStore.getState().addTask('No priority task')

    expect(useStore.getState().tasks[0].priority).toBe('medium')
  })
})

describe('deleteTask (with rollback)', () => {
  beforeEach(() => {
    resetMockDefaults()
  })

  it('removes the task optimistically', async () => {
    const task = makeTask({ id: 'task-to-delete' })
    resetStore([task])

    mockEq.mockResolvedValueOnce({ error: null })

    await useStore.getState().deleteTask('task-to-delete')

    expect(useStore.getState().tasks).toHaveLength(0)
  })

  it('restores the task and shows error toast when Supabase delete fails', async () => {
    const task = makeTask({ id: 'task-to-delete', title: 'Important task' })
    resetStore([task])

    // delete().eq() rejects
    mockEq.mockResolvedValueOnce({ error: { message: 'Delete failed' } })

    await useStore.getState().deleteTask('task-to-delete')

    const tasks = useStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe('task-to-delete')
    expect(useStore.getState().toast).toMatchObject({ type: 'error' })
  })

  it('does not restore if the task was not found in the store', async () => {
    resetStore([])

    mockEq.mockResolvedValueOnce({ error: { message: 'Delete failed' } })

    // Should not throw even when the task doesn't exist
    await expect(useStore.getState().deleteTask('ghost-id')).resolves.toBeUndefined()
    expect(useStore.getState().tasks).toHaveLength(0)
  })
})

describe('toggleTask', () => {
  beforeEach(() => {
    resetMockDefaults()
  })

  it('flips is_completed from false to true optimistically', async () => {
    const task = makeTask({ id: 'task-1', is_completed: false })
    resetStore([task])

    const updatedTask = { ...task, is_completed: true }
    const chainedEq = { select: vi.fn().mockResolvedValue({ data: [updatedTask], error: null }) }
    const chainedUpdate = { eq: vi.fn().mockReturnValue(chainedEq) }
    mockUpdate.mockReturnValueOnce(chainedUpdate)

    // Check the optimistic flip happens synchronously
    const actionPromise = useStore.getState().toggleTask('task-1', false)
    expect(useStore.getState().tasks[0].is_completed).toBe(true)

    await actionPromise
    expect(useStore.getState().tasks[0].is_completed).toBe(true)
  })

  it('flips is_completed from true to false', async () => {
    const task = makeTask({ id: 'task-1', is_completed: true })
    resetStore([task])

    const updatedTask = { ...task, is_completed: false }
    const chainedEq = { select: vi.fn().mockResolvedValue({ data: [updatedTask], error: null }) }
    const chainedUpdate = { eq: vi.fn().mockReturnValue(chainedEq) }
    mockUpdate.mockReturnValueOnce(chainedUpdate)

    await useStore.getState().toggleTask('task-1', true)

    expect(useStore.getState().tasks[0].is_completed).toBe(false)
  })

  it('rolls back to original status and shows error toast when Supabase fails', async () => {
    const task = makeTask({ id: 'task-1', is_completed: false })
    resetStore([task])

    const chainedEq = { select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }) }
    const chainedUpdate = { eq: vi.fn().mockReturnValue(chainedEq) }
    mockUpdate.mockReturnValueOnce(chainedUpdate)

    await useStore.getState().toggleTask('task-1', false)

    // Should be rolled back to original
    expect(useStore.getState().tasks[0].is_completed).toBe(false)
    expect(useStore.getState().toast).toMatchObject({ type: 'error' })
  })

  it('leaves other tasks untouched', async () => {
    const task1 = makeTask({ id: 'task-1', is_completed: false })
    const task2 = makeTask({ id: 'task-2', is_completed: false })
    resetStore([task1, task2])

    const updatedTask = { ...task1, is_completed: true }
    const chainedEq = { select: vi.fn().mockResolvedValue({ data: [updatedTask], error: null }) }
    const chainedUpdate = { eq: vi.fn().mockReturnValue(chainedEq) }
    mockUpdate.mockReturnValueOnce(chainedUpdate)

    await useStore.getState().toggleTask('task-1', false)

    const tasks = useStore.getState().tasks
    expect(tasks.find(t => t.id === 'task-1')?.is_completed).toBe(true)
    expect(tasks.find(t => t.id === 'task-2')?.is_completed).toBe(false)
  })
})
