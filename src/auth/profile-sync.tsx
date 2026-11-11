import { useEffect, useState } from 'react';

import { useProfile } from '@/onboarding/profile';

import { fetchRemoteProfile, saveRemoteProfile } from './remote-profile';
import { useSession } from './session';

const SAVE_DELAY_MS = 600;

/**
 * Keeps the profile on the device and the one in the user's account in step.
 * On sign-in it pulls once (a finished profile in the account wins), then
 * saves every later change. Renders nothing.
 */
export function ProfileSync() {
  const { session } = useSession();
  const { ready, answers, onboarded, onboardedAt, load } = useProfile();
  const userId = session?.user.id;
  const [pulledFor, setPulledFor] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !ready || pulledFor === userId) return;
    let cancelled = false;
    fetchRemoteProfile(userId)
      .then((remote) => {
        if (cancelled) return;
        if (remote?.onboarded) load(remote);
        setPulledFor(userId);
      })
      // Offline or a server error: keep using the device copy and try again next launch.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, ready, pulledFor, load]);

  useEffect(() => {
    if (!userId || pulledFor !== userId) return;
    const timer = setTimeout(() => {
      saveRemoteProfile(userId, { answers, onboarded, onboardedAt }).catch(() => {});
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [userId, pulledFor, answers, onboarded, onboardedAt]);

  return null;
}
