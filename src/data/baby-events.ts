import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/auth/session';
import { supabase } from '@/lib/supabase';

export type BabyEventKind = 'feed' | 'sleep' | 'diaper';
export type BabyEvent = { id: string; kind: BabyEventKind; occurredAt: string };

function startOfToday(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

/** Everything logged for the baby since midnight, newest first. */
export function useTodayBabyEvents() {
  const { session } = useSession();
  const userId = session?.user.id;
  const [events, setEvents] = useState<BabyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('baby_events')
      .select('id, kind, occurred_at')
      .eq('user_id', userId)
      .gte('occurred_at', startOfToday())
      .order('occurred_at', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (cancelled) return;
        if (loadError) setError('Couldn’t load today’s log. Check your connection.');
        else setEvents((data ?? []).map((row) => ({ id: row.id, kind: row.kind, occurredAt: row.occurred_at })));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const add = useCallback(
    async (kind: BabyEventKind) => {
      if (!userId) return;
      setError(null);
      const { data, error: addError } = await supabase
        .from('baby_events')
        .insert({ user_id: userId, kind })
        .select('id, kind, occurred_at')
        .single();
      if (addError || !data) {
        setError('Couldn’t save that. Check your connection and try again.');
        return;
      }
      setEvents((list) => [{ id: data.id, kind: data.kind, occurredAt: data.occurred_at }, ...list]);
    },
    [userId],
  );

  const remove = useCallback(
    async (id: string) => {
      setError(null);
      const { error: removeError } = await supabase.from('baby_events').delete().eq('id', id);
      if (removeError) {
        setError('Couldn’t remove that. Check your connection and try again.');
        return;
      }
      setEvents((list) => list.filter((event) => event.id !== id));
    },
    [],
  );

  return { events, loading, error, add, remove };
}
