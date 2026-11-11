import { router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useProfile } from '@/onboarding/profile';

import { fetchRemoteProfile } from './remote-profile';

/**
 * Where to send someone right after they sign in or create an account:
 * home if they have finished onboarding (here or on another device),
 * otherwise into onboarding.
 */
export function useAfterAuth() {
  const { onboarded, load } = useProfile();

  return async () => {
    const { data } = await supabase.auth.getUser();
    const remote = data.user ? await fetchRemoteProfile(data.user.id).catch(() => null) : null;
    if (remote?.onboarded) load(remote);
    if (router.canDismiss()) router.dismissAll();
    router.replace(remote?.onboarded || onboarded ? '/home' : '/meet-momo');
  };
}
