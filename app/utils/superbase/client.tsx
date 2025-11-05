import { createClient } from '@supabase/supabase-js';
import { publicAnonKey, projectId } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Auth helper functions
export const auth = {
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({
      email,
      password
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    return await supabase.auth.getSession();
  },

  async getUser() {
    return await supabase.auth.getUser();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};