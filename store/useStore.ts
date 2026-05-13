import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Event = {
  id: string;
  title: string;
  date: string;
  all_day: boolean;
};

type Habit = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type HabitLog = {
  id: string;
  habit_id: string;
  completed_date: string;
};

type Note = {
  id: string;
  content: string;
  created_at: string;
};

type MoodLog = {
  id: string;
  mood: string;
  date: string;
};

export type TaskPriority = 'high' | 'medium' | 'low';

type Task = {
  id: string;
  title: string;
  is_completed: boolean;
  priority: TaskPriority;
  created_at: string;
};

type Toast = { message: string; type: 'success' | 'error' } | null;

interface AppState {
  events: Event[];
  habits: Habit[];
  habitLogs: HabitLog[];
  notes: Note[];
  moodLogs: MoodLog[];
  tasks: Task[];
  isLoading: boolean;
  isCheckingSession: boolean;
  toast: Toast;

  user: User | null;
  checkUser: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<{error: string | null}>;
  signUp: (email: string, pass: string) => Promise<{error: string | null}>;
  signOut: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  clearToast: () => void;

  fetchData: () => Promise<void>;

  // Events
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Habits
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Habit Logs
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;

  // Notes (Brain Dump)
  addNote: (content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;

  // Mood Tracker
  setDailyMood: (mood: string, date: string) => Promise<void>;

  // Tasks
  addTask: (title: string, priority?: TaskPriority) => Promise<void>;
  toggleTask: (id: string, currentStatus: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  updateTask: (id: string, title: string, priority: TaskPriority) => Promise<void>;
}

const tempId = () => `optimistic-${Date.now()}-${Math.random()}`;

export const useStore = create<AppState>((set, get) => ({
  events: [],
  habits: [],
  habitLogs: [],
  notes: [],
  moodLogs: [],
  tasks: [],
  isLoading: false,
  isCheckingSession: true,
  toast: null,
  user: null,

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => set({ toast: null }),

  checkUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null, isCheckingSession: false });

    if (session?.user) {
      get().fetchData();
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, isCheckingSession: false });
      if(session?.user) get().fetchData();
      else set({ events: [], habits: [], habitLogs: [], notes: [], moodLogs: [], tasks: [] });
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message || null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  fetchData: async () => {
    const user = get().user;
    if (!user) return;

    set({ isLoading: true });
    const [eventsRes, habitsRes, logsRes, notesRes, moodsRes, tasksRes] = await Promise.all([
      supabase.from('events').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('habit_logs').select('*').eq('user_id', user.id),
      supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('mood_logs').select('*').eq('user_id', user.id),
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    const tableNames = ['events', 'habits', 'habit_logs', 'notes', 'mood_logs', 'tasks'];
    [eventsRes, habitsRes, logsRes, notesRes, moodsRes, tasksRes].forEach((res, i) => {
      if (res.error) console.error(`[fetchData] Error en tabla "${tableNames[i]}":`, res.error.message);
    });

    set({
      events: eventsRes.data || [],
      habits: habitsRes.data || [],
      habitLogs: logsRes.data || [],
      notes: notesRes.data || [],
      moodLogs: moodsRes.data || [],
      tasks: tasksRes.data || [],
      isLoading: false
    });
  },

  addEvent: async (event) => {
    const user = get().user;
    if(!user) return;
    const tid = tempId();
    const tempEvent: Event = { ...event, id: tid };
    set((s) => ({ events: [...s.events, tempEvent] }));
    const { data, error } = await supabase.from('events').insert([{ ...event, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ events: s.events.map(e => e.id === tid ? data[0] : e) }));
    } else {
      set((s) => ({ events: s.events.filter(e => e.id !== tid) }));
      get().showToast(`Error al guardar el evento: ${error?.message}`, 'error');
    }
  },

  deleteEvent: async (id) => {
    const eventToDelete = get().events.find(e => e.id === id);
    set((s) => ({ events: s.events.filter(e => e.id !== id) }));
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      if (eventToDelete) set((s) => ({ events: [...s.events, eventToDelete] }));
      get().showToast(`Error al eliminar el evento: ${error.message}`, 'error');
    }
  },

  addHabit: async (habit) => {
    const user = get().user;
    if(!user) return;
    const tid = tempId();
    const tempHabit: Habit = { ...habit, id: tid };
    set((s) => ({ habits: [...s.habits, tempHabit] }));
    const { data, error } = await supabase.from('habits').insert([{ ...habit, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ habits: s.habits.map(h => h.id === tid ? data[0] : h) }));
    } else {
      set((s) => ({ habits: s.habits.filter(h => h.id !== tid) }));
      get().showToast(`Error al crear el hábito: ${error?.message}`, 'error');
    }
  },

  deleteHabit: async (id) => {
    const state = get();
    const habitToDelete = state.habits.find(h => h.id === id);
    const logsToDelete = state.habitLogs.filter(l => l.habit_id === id);
    set((s) => ({
      habits: s.habits.filter(h => h.id !== id),
      habitLogs: s.habitLogs.filter(l => l.habit_id !== id)
    }));
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      if (habitToDelete) {
        set((s) => ({
          habits: [...s.habits, habitToDelete],
          habitLogs: [...s.habitLogs, ...logsToDelete]
        }));
      }
      get().showToast(`Error al eliminar el hábito: ${error.message}`, 'error');
    }
  },

  toggleHabitLog: async (habitId, date) => {
    const state = get();
    if(!state.user) return;

    const existingLog = state.habitLogs.find(l => l.habit_id === habitId && l.completed_date === date);

    if (existingLog) {
      set((s) => ({ habitLogs: s.habitLogs.filter(l => l.id !== existingLog.id) }));
      const { error } = await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      if (error) {
        set((s) => ({ habitLogs: [...s.habitLogs, existingLog] }));
        get().showToast(`Error al desmarcar: ${error.message}`, 'error');
      }
    } else {
      const tid = tempId();
      const tempLog: HabitLog = { id: tid, habit_id: habitId, completed_date: date };
      set((s) => ({ habitLogs: [...s.habitLogs, tempLog] }));
      const { data, error } = await supabase.from('habit_logs').insert([{ habit_id: habitId, completed_date: date, user_id: state.user!.id }]).select();
      if (!error && data) {
        set((s) => ({ habitLogs: s.habitLogs.map(l => l.id === tid ? data[0] : l) }));
      } else {
        set((s) => ({ habitLogs: s.habitLogs.filter(l => l.id !== tid) }));
        get().showToast(`Error al registrar: ${error?.message}`, 'error');
      }
    }
  },

  addNote: async (content) => {
    const user = get().user;
    if(!user) return;
    const tid = tempId();
    const tempNote: Note = { id: tid, content, created_at: new Date().toISOString() };
    set((s) => ({ notes: [tempNote, ...s.notes] }));
    const { data, error } = await supabase.from('notes').insert([{ content, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ notes: s.notes.map(n => n.id === tid ? data[0] : n) }));
    } else {
      set((s) => ({ notes: s.notes.filter(n => n.id !== tid) }));
      get().showToast(`Error al guardar la nota: ${error?.message}`, 'error');
    }
  },

  deleteNote: async (id) => {
    const noteToDelete = get().notes.find(n => n.id === id);
    set((s) => ({ notes: s.notes.filter(n => n.id !== id) }));
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      if (noteToDelete) set((s) => ({ notes: [noteToDelete, ...s.notes] }));
      get().showToast(`Error al eliminar la nota: ${error.message}`, 'error');
    }
  },

  updateNote: async (id, content) => {
    if (!get().user) return;
    const original = get().notes.find(n => n.id === id);
    if (!original) return;
    set((s) => ({ notes: s.notes.map(n => n.id === id ? { ...n, content } : n) }));
    const { data, error } = await supabase.from('notes').update({ content }).eq('id', id).select();
    if (!error && data) {
      set((s) => ({ notes: s.notes.map(n => n.id === id ? data[0] : n) }));
    } else {
      set((s) => ({ notes: s.notes.map(n => n.id === id ? original : n) }));
      get().showToast(`Error al actualizar la nota: ${error?.message}`, 'error');
    }
  },

  setDailyMood: async (mood, date) => {
    const user = get().user;
    if(!user) return;

    const existing = get().moodLogs.find(m => m.date === date);

    if (existing) {
      const prevMood = existing.mood;
      set((s) => ({ moodLogs: s.moodLogs.map(m => m.date === date ? { ...m, mood } : m) }));
      const { data, error } = await supabase.from('mood_logs').update({ mood }).eq('id', existing.id).select();
      if (!error && data) {
        set((s) => ({ moodLogs: s.moodLogs.map(m => m.date === date ? data[0] : m) }));
      } else if (error) {
        set((s) => ({ moodLogs: s.moodLogs.map(m => m.date === date ? { ...m, mood: prevMood } : m) }));
        get().showToast(`Error al guardar el estado de ánimo: ${error.message}`, 'error');
      }
    } else {
      const tid = tempId();
      const tempMood: MoodLog = { id: tid, mood, date };
      set((s) => ({ moodLogs: [...s.moodLogs, tempMood] }));
      const { data, error } = await supabase.from('mood_logs').insert([{ mood, date, user_id: user.id }]).select();
      if (!error && data) {
        set((s) => ({ moodLogs: s.moodLogs.map(m => m.id === tid ? data[0] : m) }));
      } else if (error) {
        set((s) => ({ moodLogs: s.moodLogs.filter(m => m.id !== tid) }));
        get().showToast(`Error al guardar el estado de ánimo: ${error.message}`, 'error');
      }
    }
  },

  addTask: async (title, priority = 'medium') => {
    const user = get().user;
    if(!user) return;
    const tid = tempId();
    const tempTask: Task = { id: tid, title, priority, is_completed: false, created_at: new Date().toISOString() };
    set((s) => ({ tasks: [tempTask, ...s.tasks] }));
    const { data, error } = await supabase.from('tasks').insert([{ title, priority, user_id: user.id }]).select();
    if (!error && data) {
      set((s) => ({ tasks: s.tasks.map(t => t.id === tid ? data[0] : t) }));
    } else {
      set((s) => ({ tasks: s.tasks.filter(t => t.id !== tid) }));
      get().showToast(`Error al añadir la tarea: ${error?.message}`, 'error');
    }
  },

  toggleTask: async (id, currentStatus) => {
    const newStatus = !currentStatus;
    set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, is_completed: newStatus } : t) }));
    const { data, error } = await supabase.from('tasks').update({ is_completed: newStatus }).eq('id', id).select();
    if (!error && data) {
      set((s) => ({ tasks: s.tasks.map(t => t.id === id ? data[0] : t) }));
    } else {
      set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, is_completed: currentStatus } : t) }));
      get().showToast(`Error al actualizar la tarea: ${error?.message}`, 'error');
    }
  },

  deleteTask: async (id) => {
    const taskToDelete = get().tasks.find(t => t.id === id);
    set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) }));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      if (taskToDelete) set((s) => ({ tasks: [taskToDelete, ...s.tasks] }));
      get().showToast(`Error al eliminar la tarea: ${error.message}`, 'error');
    }
  },

  updateTask: async (id, title, priority) => {
    if (!get().user) return;
    const original = get().tasks.find(t => t.id === id);
    if (!original) return;
    set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, title, priority } : t) }));
    const { data, error } = await supabase.from('tasks').update({ title, priority }).eq('id', id).select();
    if (!error && data) {
      set((s) => ({ tasks: s.tasks.map(t => t.id === id ? data[0] : t) }));
    } else {
      set((s) => ({ tasks: s.tasks.map(t => t.id === id ? original : t) }));
      get().showToast(`Error al actualizar la tarea: ${error?.message}`, 'error');
    }
  },

  clearCompletedTasks: async () => {
    const completed = get().tasks.filter(t => t.is_completed);
    if (completed.length === 0) return;
    set((s) => ({ tasks: s.tasks.filter(t => !t.is_completed) }));
    const ids = completed.map(t => t.id);
    const { error } = await supabase.from('tasks').delete().in('id', ids);
    if (error) {
      set((s) => ({ tasks: [...completed, ...s.tasks] }));
      get().showToast(`Error al limpiar tareas: ${error.message}`, 'error');
    }
  }
}));
