import * as AppleAuthentication from 'expo-apple-authentication';
import { useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, type } from '@/theme';

import { BackButton } from './buttons';
import { MomoAvatar } from './chat';

type ScreenProps = { title: string; subtitle?: string; onBack?: () => void; children: ReactNode };

/** Shared layout for the account screens: Momo, a title, then the form. */
export function AuthScreen({ title, subtitle, onBack, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {onBack && <BackButton onPress={onBack} />}
          <View style={styles.head}>
            <MomoAvatar />
            <Text style={type.title}>{title}</Text>
            {subtitle && <Text style={[type.label, styles.subtitle]}>{subtitle}</Text>}
          </View>
          <View style={styles.form}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textFaint}
      autoCapitalize="none"
      autoCorrect={false}
      accessibilityLabel={props.placeholder}
      {...props}
      style={[styles.field, props.style]}
    />
  );
}

/** Inline problem report. Renders nothing when there is no message. */
export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Text accessibilityRole="alert" style={styles.error}>
      {message}
    </Text>
  );
}

export function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={type.label}>or</Text>
      <View style={styles.line} />
    </View>
  );
}

type AppleProps = { mode: 'sign-in' | 'sign-up'; onPress: () => void };

/** Apple's own button. Hidden where Sign in with Apple is unavailable. */
export function AppleButton({ mode, onPress }: AppleProps) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  if (!available) return null;

  return (
    <>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={
          mode === 'sign-up'
            ? AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
            : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
        }
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={30}
        style={styles.apple}
        onPress={onPress}
      />
      <Divider />
    </>
  );
}

/** Turns anything thrown into a sentence a person can act on. */
export function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  if (/network request failed|failed to fetch/i.test(message)) {
    return 'Can’t reach Momora right now. Check your connection and try again.';
  }
  return message || 'Something went wrong. Please try again.';
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const MIN_PASSWORD = 8;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 28 },
  head: { gap: 10, marginTop: 8 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  form: { gap: 14 },
  field: {
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    fontFamily: fonts.medium,
    fontSize: 18,
    color: colors.text,
  },
  error: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, color: '#B3261E', paddingHorizontal: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  apple: { height: 60, alignSelf: 'stretch' },
});
