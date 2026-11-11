import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/onboarding/profile';
import { colors, fonts, type } from '@/theme';

/**
 * Placeholder. The real home screen (one per stage) is the next piece of
 * work; this only confirms the user is signed in and onboarded.
 */
export default function Home() {
  const { answers, reset } = useProfile();
  const { session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  if (!session && !signingOut) return <Redirect href="/" />;

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut({ scope: 'local' });
    // Leave nothing about this person on the device.
    reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Image source={require('@/assets/images/momo-3d.png')} style={styles.momo} contentFit="contain" />
      <Text style={[type.title, styles.center]}>You’re all set{answers.name ? `, ${answers.name}` : ''}.</Text>
      <Text style={[type.label, styles.center]}>Your home screen is being built.</Text>
      {session?.user.email && <Text style={[type.label, styles.center]}>Signed in as {session.user.email}</Text>}
      <Pressable accessibilityRole="button" onPress={signOut} disabled={signingOut} hitSlop={12}>
        <Text style={styles.signOut}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  momo: { width: 180, height: 185 },
  center: { textAlign: 'center' },
  signOut: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, textDecorationLine: 'underline', marginTop: 24 },
});
