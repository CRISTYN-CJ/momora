import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/auth/session';
import { supabase } from '@/lib/supabase';
import { todayISO } from '@/onboarding/dates';

export const MOODS = [
  { value: 'overwhelmed', emoji: '😣', label: 'Overwhelmed' },
  { value: 'anxious', emoji: '😟', label: 'Anxious' },
  { value: 'unsure', emoji: '😐', label: 'Not sure' },
  { value: 'excited', emoji: '🤩', label: 'Excited' },
  { value: 'hopeful', emoji: '😊', label: 'Hopeful' },
] as const;

export type Mood = (typeof MOODS)[number]['value'];

/** Today's mood check-in for the signed-in user. */
export function useTodayCheckIn() {
  const { session } = useSession();
  const userId = session?.user.id;
  const [mood, setMood] = useState<Mood | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('check_ins')
      .select('mood')
      .eq('user_id', userId)
      .eq('day', todayISO())
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setMood(data.mood as Mood);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = useCallback(
    async (next: Mood) => {
      if (!userId) return;
      const previous = mood;
      setMood(next);
      setError(null);
      const { error: saveError } = await supabase
        .from('check_ins')
        .upsert({ user_id: userId, day: todayISO(), mood: next });
      if (saveError) {
        setMood(previous);
        setError('Couldn’t save your check-in. Check your connection and try again.');
      }
    },
    [userId, mood],
  );

  return { mood, save, error };
}
