import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Answers, AnswerValue } from './types';

const STORAGE_KEY = 'momora.profile.v1';

export type Profile = {
  answers: Answers;
  onboarded: boolean;
  /** When onboarding was finished, as an ISO timestamp. */
  onboardedAt?: string;
};

type ProfileContextValue = Profile & {
  /** False until the saved profile has been read from the device. */
  ready: boolean;
  setAnswer: (id: string, value: AnswerValue | undefined) => void;
  completeOnboarding: () => void;
  /** Replace everything, e.g. with the profile saved in the user's account. */
  load: (profile: Profile) => void;
  reset: () => void;
};

const empty: Profile = { answers: {}, onboarded: false };

const ProfileContext = createContext<ProfileContextValue | null>(null);

/**
 * Holds what the user told Momo. Kept on the device so the app opens
 * instantly; `ProfileSync` mirrors it to the user's account once signed in.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setProfile({ ...empty, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
  }, [profile, ready]);

  const setAnswer = useCallback((id: string, value: AnswerValue | undefined) => {
    setProfile((p) => ({ ...p, answers: { ...p.answers, [id]: value } }));
  }, []);
  const completeOnboarding = useCallback(
    () => setProfile((p) => ({ ...p, onboarded: true, onboardedAt: p.onboardedAt ?? new Date().toISOString() })),
    [],
  );
  const load = useCallback((next: Profile) => setProfile(next), []);
  const reset = useCallback(() => setProfile(empty), []);

  const value = useMemo(
    () => ({ ...profile, ready, setAnswer, completeOnboarding, load, reset }),
    [profile, ready, setAnswer, completeOnboarding, load, reset],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile must be used inside ProfileProvider');
  return value;
}
