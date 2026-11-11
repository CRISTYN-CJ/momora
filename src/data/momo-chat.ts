import { FunctionsHttpError } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/auth/session';
import { supabase } from '@/lib/supabase';

export type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };

type Row = { id: string; role: 'user' | 'assistant'; content: string };

const HISTORY_LIMIT = 60;
export const MAX_MESSAGE_CHARS = 2000;

/** Wording for each failure the server can report. */
const ERRORS: Record<string, string> = {
  not_configured: 'Momo isn’t switched on yet. Please try again later.',
  daily_limit: 'You’ve reached today’s message limit. Momo will be back tomorrow.',
  busy: 'Momo is helping a lot of people right now. Try again in a moment.',
  not_signed_in: 'Your session has expired. Sign in again to talk to Momo.',
  message_too_long: `That message is too long. Keep it under ${MAX_MESSAGE_CHARS} characters.`,
};
const GENERIC_ERROR = 'Momo couldn’t answer just now. Please try again.';
const OFFLINE_ERROR = 'Can’t reach Momo. Check your connection and try again.';

/** The conversation with Momo: saved history plus sending a new message. */
export function useMomoChat() {
  const { session } = useSession();
  const userId = session?.user.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  /** The text of a message that failed to send, kept so it can be retried. */
  const [failed, setFailed] = useState<{ text: string; reason: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('chat_messages')
      .select('id, role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT)
      .then(({ data }) => {
        if (cancelled) return;
        setMessages(((data ?? []) as Row[]).reverse());
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      setFailed(null);
      setSending(true);

      // Show the user's message straight away; the server's copy replaces it.
      const pendingId = `pending-${Date.now()}`;
      setMessages((list) => [...list, { id: pendingId, role: 'user', content: trimmed }]);

      const { data, error } = await supabase.functions.invoke<{ messages: Row[] }>('momo-chat', {
        body: { message: trimmed },
      });

      if (error || !data?.messages) {
        let reason = OFFLINE_ERROR;
        if (error instanceof FunctionsHttpError) {
          const body = await error.context.json().catch(() => null);
          reason = ERRORS[body?.code as string] ?? GENERIC_ERROR;
        }
        setMessages((list) => list.filter((m) => m.id !== pendingId));
        setFailed({ text: trimmed, reason });
      } else {
        setMessages((list) => [...list.filter((m) => m.id !== pendingId), ...data.messages]);
      }
      setSending(false);
    },
    [sending],
  );

  const retry = useCallback(() => {
    if (failed) send(failed.text);
  }, [failed, send]);

  return { messages, loading, sending, failed, send, retry, dismissFailure: () => setFailed(null) };
}
