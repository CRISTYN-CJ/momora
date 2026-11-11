import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { signInWithApple } from '@/auth/apple';
import { useAfterAuth } from '@/auth/use-after-auth';
import { AppleButton, AuthScreen, describeError, ErrorText, Field, isEmail } from '@/components/auth';
import { PillButton } from '@/components/buttons';
import { supabase } from '@/lib/supabase';
import { colors, fonts } from '@/theme';

export default function SignIn() {
  const afterAuth = useAfterAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = isEmail(email) && password.length > 0;
  const address = email.trim().toLowerCase();

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const withApple = () =>
    run(async () => {
      if (await signInWithApple()) await afterAuth();
    });

  const withEmail = () => {
    if (!valid || busy) return;
    run(async () => {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: address, password });
      if (signInError) {
        if (/not confirmed/i.test(signInError.message)) {
          await supabase.auth.resend({ type: 'signup', email: address });
          router.push({ pathname: '/verify-code', params: { email: address, mode: 'signup' } });
          return;
        }
        if (/invalid login credentials/i.test(signInError.message)) {
          throw new Error('That email and password don’t match. Check them and try again.');
        }
        throw signInError;
      }
      await afterAuth();
    });
  };

  const forgot = () => {
    if (!isEmail(email)) {
      setError('Enter your email above first, then tap “Forgot password?”.');
      return;
    }
    run(async () => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(address);
      if (resetError) throw resetError;
      router.push({ pathname: '/verify-code', params: { email: address, mode: 'recovery' } });
    });
  };

  return (
    <AuthScreen title="Welcome back." subtitle="Sign in to pick up where you left off." onBack={() => router.back()}>
      <AppleButton mode="sign-in" onPress={withApple} />
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
        placeholder="Password"
        secureTextEntry
        textContentType="password"
        autoComplete="current-password"
        onSubmitEditing={withEmail}
      />
      <ErrorText message={error} />
      <PillButton
        wide
        label={busy ? 'Signing in…' : 'Sign in'}
        color="#000000"
        disabled={!valid || busy}
        onPress={withEmail}
      />
      <Pressable accessibilityRole="button" hitSlop={10} disabled={busy} onPress={forgot}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, textAlign: 'center', marginTop: 8 },
});
