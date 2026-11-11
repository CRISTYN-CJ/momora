import { supabase } from '@/lib/supabase';
import type { Profile } from '@/onboarding/profile';

/** The profile saved in the user's account, or null if they have none yet. */
export async function fetchRemoteProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('answers, onboarded_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    answers: data.answers ?? {},
    onboarded: data.onboarded_at !== null,
    onboardedAt: data.onboarded_at ?? undefined,
  };
}

export async function saveRemoteProfile(userId: string, profile: Profile): Promise<void> {
  const { answers } = profile;
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    name: typeof answers.name === 'string' ? answers.name : null,
    stage: typeof answers.stage === 'string' ? answers.stage : null,
    answers,
    onboarded_at: profile.onboarded ? (profile.onboardedAt ?? new Date().toISOString()) : null,
  });
  if (error) throw error;
}
