import * as profilesRepo from '../repositories/profiles.js';
import { supabaseAdmin } from '../lib/supabase.js';
import type { ProfileDTO } from '../types/api.js';
import { AppError } from '../middleware/error-handler.js';

export async function getProfile(userId: string): Promise<ProfileDTO> {
  const [profile, { data }] = await Promise.all([
    profilesRepo.findProfileById(userId),
    supabaseAdmin.auth.admin.getUserById(userId),
  ]);

  if (!profile) throw new AppError(404, 'NOT_FOUND', 'Profile not found');

  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarEmoji: profile.avatar_emoji,
    email: data.user?.email ?? '',
    language: profile.language as 'en' | 'ar',
    timezone: profile.timezone,
  };
}

export async function updateProfile(
  userId: string,
  fields: { displayName?: string; avatarEmoji?: string; language?: string; timezone?: string },
): Promise<ProfileDTO> {
  await profilesRepo.updateProfile(userId, {
    display_name: fields.displayName,
    avatar_emoji: fields.avatarEmoji,
    language: fields.language,
    timezone: fields.timezone,
  });
  return getProfile(userId);
}
