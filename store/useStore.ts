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

interface AppState {
  events: Event[];
  habits: Habit[];
  habitLogs: HabitLog[];
  notes: Note[];
  moodLogs: MoodLog[];
  isLoading: boolean;
  isCheckingSession: boolean;
  
  user: User | null;
  checkUser: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<{error: string | null}>;
  signUp: (email: string, pass: string) => Promise<{error: string | null}>;
  signOut: () => Promise<void>;

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
}

export const useStore = create<AppState>((set, get) => ({
  events: [],
  habits: [],
  habitLogs: [],
  notes: [],
  moodLogs: [],
  isLoading: false,
  isCheckingSession: true,
  user: null,

  checkUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null, isCheckingSession: false });
    
    // Escuchar cambios de sesión
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, isCheckingSession: false });
      if(session?.user) get().fetchData();
      else set({ events: [], habits: [], habitLogs: [], notes: [], moodLogs: [] });
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
    const [eventsRes, habitsRes, logsRes, notesRes, moodsRes] = await Promise.all([
      supabase.from('events').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('habit_logs').select('*').eq('user_id', user.id),
      supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('mood_logs').select('*').eq('user_id', user.id)
    ]);

    set({ 
      events: eventsRes.data || [], 
      habits: habitsRes.data || [], 
      habitLogs: logsRes.data || [],
      notes: notesRes.data || [],
      moodLogs: moodsRes.data || [],
      isLoading: false
    });
  },

  addEvent: async (event) => {
    const user = get().user;
    if(!user) return;
    const { data, error } = await supabase.from('events').insert([{ ...event, user_id: user.id }]).select();
    if (!error && data) {
      set((state) => ({ events: [...state.events, data[0]] }));
    }
  },

  deleteEvent: async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      set((state) => ({ events: state.events.filter(e => e.id !== id) }));
    }
  },

  addHabit: async (habit) => {
    const user = get().user;
    if(!user) return;
    const { data, error } = await supabase.from('habits').insert([{ ...habit, user_id: user.id }]).select();
    if (!error && data) {
      set((state) => ({ habits: [...state.habits, data[0]] }));
    }
  },

  deleteHabit: async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) {
      set((state) => ({ 
        habits: state.habits.filter(h => h.id !== id),
        habitLogs: state.habitLogs.filter(l => l.habit_id !== id)
      }));
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
      }
    } else {
      const { data, error } = await supabase.from('habit_logs').insert([{ habit_id: habitId, completed_date: date, user_id: state.user.id }]).select();
      if (!error && data) {
         set((state) => ({ habitLogs: [...state.habitLogs, data[0]] }));
      }
    }
  },

  addNote: async (content) => {
    const user = get().user;
    if(!user) return;
    const { data, error } = await supabase.from('notes').insert([{ content, user_id: user.id }]).select();
    if (!error && data) {
      set((state) => ({ notes: [data[0], ...state.notes] }));
    }
  },

  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) {
      set((state) => ({ notes: state.notes.filter(n => n.id !== id) }));
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
      }
    } else {
      const { data, error } = await supabase.from('mood_logs').insert([{ mood, date, user_id: user.id }]).select();
      if (!error && data) {
        set((state) => ({ moodLogs: [...state.moodLogs, data[0]] }));
      }
    }
  }
}));
