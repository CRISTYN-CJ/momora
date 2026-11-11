import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { BackButton, PillButton } from '@/components/buttons';
import { supabase } from '@/lib/supabase';
import { labelFor } from '@/onboarding/flow';
import { useProfile } from '@/onboarding/profile';
import { colors, fonts, type } from '@/theme';

export default function Account() {
  const { answers, reset } = useProfile();
  const { session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  if (!session && !signingOut) return <Redirect href="/" />;

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut({ scope: 'local' });
    // Leave nothing about this person on the device.
    reset();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <BackButton onPress={() => router.back()} />
      <Text style={[type.title, styles.title]}>Account</Text>

      <View style={styles.rows}>
        <Row label="Name" value={String(answers.name ?? '—')} />
        <Row label="Email" value={session?.user.email ?? 'Signed in with Apple'} />
        <Row label="Stage" value={labelFor('stage', answers.stage) || '—'} />
      </View>

      <View style={styles.flex} />
      <PillButton wide label={signingOut ? 'Signing out…' : 'Sign out'} color="#000000" disabled={signingOut} onPress={signOut} />
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={type.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  title: { marginTop: 20, marginBottom: 12 },
  rows: { backgroundColor: colors.surfaceAlt, borderRadius: 22, paddingHorizontal: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 16 },
  value: { flexShrink: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.text },
});
