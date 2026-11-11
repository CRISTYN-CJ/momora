import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAfterAuth } from '@/auth/use-after-auth';
import { AuthScreen, describeError, ErrorText, Field, MIN_PASSWORD } from '@/components/auth';
import { PillButton } from '@/components/buttons';
import { supabase } from '@/lib/supabase';
import { colors, fonts } from '@/theme';

/**
 * Enter the code emailed by Supabase. `mode=signup` confirms a new account;
 * `mode=recovery` also asks for a new password.
 */
export default function VerifyCode() {
  const params = useLocalSearchParams<{ email: string; mode: string }>();
  const email = params.email ?? '';
  const recovery = params.mode === 'recovery';
  const afterAuth = useAfterAuth();

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const valid = code.trim().length >= 6 && (!recovery || password.length >= MIN_PASSWORD);

  const submit = async () => {
    if (!valid || busy) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: recovery ? 'recovery' : 'signup',
      });
      if (verifyError) {
        throw /expired|invalid/i.test(verifyError.message)
          ? new Error('That code is wrong or has expired. Check it, or send a new one.')
          : verifyError;
      }
      if (recovery) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
      }
      await afterAuth();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { error: resendError } = recovery
        ? await supabase.auth.resetPasswordForEmail(email)
        : await supabase.auth.resend({ type: 'signup', email });
      if (resendError) throw resendError;
      setNotice('A new code is on its way.');
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      title="Check your email."
      subtitle={`I sent a code to ${email}. Enter it here${recovery ? ' and choose a new password' : ''}.`}
      onBack={() => router.back()}>
      <Field
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
        placeholder="Code from the email"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={10}
        autoFocus
      />
      {recovery && (
        <Field
          value={password}
          onChangeText={setPassword}
          placeholder={`New password (at least ${MIN_PASSWORD} characters)`}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="new-password"
        />
      )}
      <ErrorText message={error} />
      {notice && <Text style={styles.notice}>{notice}</Text>}
      <PillButton
        wide
        label={busy ? 'Checking…' : recovery ? 'Save new password' : 'Confirm'}
        color="#000000"
        disabled={!valid || busy}
        onPress={submit}
      />
      <Pressable accessibilityRole="button" hitSlop={10} disabled={busy} onPress={resend}>
        <Text style={styles.link}>Send a new code</Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, textAlign: 'center', marginTop: 8 },
  notice: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted, paddingHorizontal: 8 },
});
