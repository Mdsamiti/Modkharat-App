import { supabase } from './supabase';
import { get, patch } from './client';

/** Sign in with email/password via Supabase Auth */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign up with email/password via Supabase Auth */
export async function signUp(email: string, password: string, displayName: string, phone?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName, phone } },
  });
  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get current user profile from backend */
export async function getProfile() {
  return get<{ data: ProfileDTO }>('/v1/auth/me');
}

/** Update user profile */
export async function updateProfile(fields: {
  displayName?: string;
  avatarEmoji?: string;
  language?: 'en' | 'ar';
  timezone?: string;
  firstDayOfMonth?: number;
}) {
  return patch<{ data: ProfileDTO }>('/v1/auth/me', fields);
}

interface ProfileDTO {
  id: string;
  displayName: string;
  avatarEmoji: string;
  email: string;
  language: 'en' | 'ar';
  timezone: string;
  firstDayOfMonth: number;
}
