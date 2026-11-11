import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { signInWithApple } from '@/auth/apple';
import { useAfterAuth } from '@/auth/use-after-auth';
import { AppleButton, AuthScreen, describeError, ErrorText, Field, isEmail, MIN_PASSWORD } from '@/components/auth';
import { PillButton } from '@/components/buttons';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/onboarding/profile';
import { colors, fonts, themeFor } from '@/theme';

/** Shown after the summary: create an account so the journey is saved. */
export default function SignUp() {
  const { answers } = useProfile();
  const afterAuth = useAfterAuth();
  const theme = themeFor(String(answers.stage ?? ''));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = isEmail(email) && password.length >= MIN_PASSWORD;

  const withApple = async () => {
    setError(null);
    setBusy(true);
    try {
      if (await signInWithApple()) await afterAuth();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const withEmail = async () => {
    if (!valid || busy) return;
    setError(null);
    setBusy(true);
    try {
      const address = email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({ email: address, password });
      if (signUpError) throw signUpError;
      if (data.session) {
        await afterAuth();
      } else if (data.user && data.user.identities?.length === 0) {
        // Supabase's way of saying the address is already registered.
        setError('An account with this email already exists. Sign in instead.');
      } else {
        router.push({ pathname: '/verify-code', params: { email: address, mode: 'signup' } });
      }
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title={answers.name ? `Let’s save your journey, ${answers.name}.` : 'Let’s save your journey.'}
      subtitle="Create an account so everything you’ve told me is kept safe and comes with you to a new phone.">
      <AppleButton mode="sign-up" onPress={withApple} />
      <Field
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <Field
        value={password}
        onChangeText={setPassword}
        placeholder={`Password (at least ${MIN_PASSWORD} characters)`}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="new-password"
        onSubmitEditing={withEmail}
      />
      <ErrorText message={error} />
      <PillButton
        wide
        label={busy ? 'Creating your account…' : 'Create account'}
        color={theme.accent}
        disabled={!valid || busy}
        onPress={withEmail}
      />
      <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push('/sign-in')}>
        <Text style={styles.link}>I already have an account</Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, textAlign: 'center', marginTop: 8 },
});
