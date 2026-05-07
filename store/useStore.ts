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

type TaskPriority = 'high' | 'medium' | 'low';

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

  // Mood Tracker
  setDailyMood: (mood: string, date: string) => Promise<void>;

  // Tasks
  addTask: (title: string, priority?: TaskPriority) => Promise<void>;
  toggleTask: (id: string, currentStatus: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

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

    // Si ya hay sesión al cargar la página, cargar datos inmediatamente
    if (session?.user) {
      get().fetchData();
    }
    
    // Escuchar cambios de sesión (login/logout)
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

    // Log potential errors without blocking the whole UI
    const results = [eventsRes, habitsRes, logsRes, notesRes, moodsRes, tasksRes];
    results.forEach((res, i) => {
      if (res.error) console.error(`Error fetching table index ${i}:`, res.error);
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
    const { data, error } = await supabase.from('events').insert([{ ...event, user_id: user.id }]).select();
    if (!error && data) {
      set((state) => ({ events: [...state.events, data[0]] }));
    } else if (error) {
      get().showToast('Error al guardar el evento', 'error');
    }
  },

  deleteEvent: async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      set((state) => ({ events: state.events.filter(e => e.id !== id) }));
    } else {
      get().showToast('Error al eliminar el evento', 'error');
    }
  },

  addHabit: async (habit) => {
    const user = get().user;
    if(!user) return;
    const { data, error } = await supabase.from('habits').insert([{ ...habit, user_id: user.id }]).select();
    if (!error && data) {
      set((state) => ({ habits: [...state.habits, data[0]] }));
    } else if (error) {
      get().showToast('Error al crear el hábito', 'error');
    }
  },

  deleteHabit: async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) {
      set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
        habitLogs: state.habitLogs.filter(l => l.habit_id !== id)
      }));
    } else {
      get().showToast('Error al eliminar el hábito', 'error');
    }
  },

  toggleHabitLog: async (habitId, date) => {
    const state = get();
    if(!state.user) return;

    const existingLog = state.habitLogs.find(l => l.habit_id === habitId && l.completed_date === date);

    if (existingLog) {
      const { error } = await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      if (!error) {
         set((state) => ({ habitLogs: state.habitLogs.filter(l => l.id !== existingLog.id) }));
      } else {
         get().showToast('Error al actualizar el hábito', 'error');
      }
    } else {
      const { data, error } = await supabase.from('habit_logs').insert([{ habit_id: habitId, completed_date: date, user_id: state.user!.id }]).select();
      if (!error && data) {
         set((state) => ({ habitLogs: [...state.habitLogs, data[0]] }));
      } else {
         get().showToast('Error al registrar el hábito', 'error');
      }
    }
  },

  addNote: async (content) => {
    const user = get().user;
    if(!user) return;
    const { data, error } = await supabase.from('notes').insert([{ content, user_id: user.id }]).select();
    if (!error && data) {
      set((state) => ({ notes: [data[0], ...state.notes] }));
    } else if (error) {
      get().showToast('Error al guardar la nota', 'error');
    }
  },

  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) {
      set((state) => ({ notes: state.notes.filter(n => n.id !== id) }));
    } else {
      get().showToast('Error al eliminar la nota', 'error');
    }
  },

  setDailyMood: async (mood, date) => {
    const user = get().user;
    if(!user) return;

    const existing = get().moodLogs.find(m => m.date === date);

    if (existing) {
      const { data, error } = await supabase.from('mood_logs').update({ mood }).eq('id', existing.id).select();
      if (!error && data) {
        set((state) => ({ moodLogs: state.moodLogs.map(m => m.date === date ? data[0] : m) }));
      } else if (error) {
        get().showToast('Error al guardar el estado de ánimo', 'error');
      }
    } else {
      const { data, error } = await supabase.from('mood_logs').insert([{ mood, date, user_id: user.id }]).select();
      if (!error && data) {
        set((state) => ({ moodLogs: [...state.moodLogs, data[0]] }));
      } else if (error) {
        get().showToast('Error al guardar el estado de ánimo', 'error');
      }
    }
  },

  addTask: async (title, priority = 'medium') => {
    const user = get().user;
    if(!user) return;
    const { data, error } = await supabase.from('tasks').insert([{ title, priority, user_id: user.id }]).select();
    if (!error && data) {
      set((state) => ({ tasks: [data[0], ...state.tasks] }));
    } else if (error) {
      get().showToast('Error al añadir la tarea', 'error');
    }
  },

  toggleTask: async (id, currentStatus) => {
    const { data, error } = await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', id).select();
    if (!error && data) {
      set((state) => ({ tasks: state.tasks.map(t => t.id === id ? data[0] : t) }));
    } else if (error) {
      get().showToast('Error al actualizar la tarea', 'error');
    }
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));
    } else {
      get().showToast('Error al eliminar la tarea', 'error');
    }
  }
}));
