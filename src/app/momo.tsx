import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { BackButton, PillButton } from '@/components/buttons';
import { MomoAvatar, TypingIndicator } from '@/components/chat';
import { MAX_MESSAGE_CHARS, useMomoChat } from '@/data/momo-chat';
import { useProfile } from '@/onboarding/profile';
import { colors, fonts, radius, themeFor, type } from '@/theme';

const STARTERS: Record<string, string[]> = {
  ttc: ['How does the fertile window work?', 'What can I do while I wait to test?', 'I’m finding this stressful'],
  pregnancy: ['What’s happening this week?', 'What should I ask at my next appointment?', 'I’m feeling anxious today'],
  postdelivery: ['How often do newborns usually feed?', 'How can I get more rest?', 'I’m feeling overwhelmed'],
};

/** A free conversation with Momo, the AI companion. */
export default function Momo() {
  const { session } = useSession();
  const { answers } = useProfile();
  const chat = useMomoChat();
  const [draft, setDraft] = useState('');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const theme = themeFor(String(answers.stage ?? ''));

  // Keep the newest message in view.
  useEffect(() => {
    const timer = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [chat.messages.length, chat.sending, chat.failed]);

  if (!session) return <Redirect href="/" />;

  const submit = (text: string) => {
    if (!text.trim() || chat.sending) return;
    setDraft('');
    chat.send(text);
  };

  const starters = STARTERS[String(answers.stage)] ?? STARTERS.pregnancy;
  const empty = !chat.loading && chat.messages.length === 0 && !chat.sending && !chat.failed;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Momo</Text>
            <Text style={type.caption}>AI companion · not medical advice</Text>
          </View>
        </View>

        <ScrollView
          ref={scroll}
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {empty && (
            <View style={styles.empty}>
              <MomoAvatar />
              <View style={styles.momoBubble}>
                <Text style={type.body}>
                  Hi{answers.name ? ` ${answers.name}` : ''}, I’m here. Ask me anything about your journey, or just tell
                  me how today is going.
                </Text>
              </View>
              <View style={styles.starters}>
                {starters.map((starter) => (
                  <Pressable
                    key={starter}
                    accessibilityRole="button"
                    onPress={() => submit(starter)}
                    style={({ pressed }) => [styles.starter, pressed && { opacity: 0.7 }]}>
                    <Text style={styles.starterText}>{starter}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {chat.messages.map((message, i) => {
            const mine = message.role === 'user';
            const showAvatar = !mine && (i === 0 || chat.messages[i - 1].role === 'user');
            return (
              <View key={message.id} style={mine ? styles.mine : styles.theirs}>
                {showAvatar && <MomoAvatar />}
                <View style={[mine ? styles.userBubble : styles.momoBubble, mine && { backgroundColor: theme.accent }]}>
                  <Text selectable style={[type.body, mine && styles.userText]}>
                    {message.content}
                  </Text>
                </View>
              </View>
            );
          })}

          {chat.sending && <TypingIndicator />}

          {chat.failed && (
            <View style={styles.failure} accessibilityRole="alert">
              <Text style={styles.failureQuote} numberOfLines={3}>
                Not sent: “{chat.failed.text}”
              </Text>
              <Text style={styles.failureText}>{chat.failed.reason}</Text>
              <View style={styles.failureActions}>
                <Pressable accessibilityRole="button" hitSlop={8} onPress={chat.retry}>
                  <Text style={styles.failureLink}>Try again</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {
                    setDraft(chat.failed?.text ?? '');
                    chat.dismissFailure();
                  }}>
                  <Text style={styles.failureLink}>Edit message</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        <Text style={styles.disclaimer}>
          Momo can’t replace your doctor or midwife. In an emergency, call your local emergency number.
        </Text>
        <View style={styles.bar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message Momo"
            placeholderTextColor={colors.textFaint}
            multiline
            maxLength={MAX_MESSAGE_CHARS}
            style={styles.input}
            accessibilityLabel="Message Momo"
          />
          <PillButton
            label="Send"
            color={theme.accent}
            disabled={!draft.trim() || chat.sending}
            onPress={() => submit(draft)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const bubble = { borderRadius: radius.bubble, paddingHorizontal: 18, paddingVertical: 13, maxWidth: '88%' } as const;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 8 },
  headerText: { gap: 1 },
  title: { fontFamily: fonts.semibold, fontSize: 20, color: colors.text },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  empty: { alignItems: 'flex-start', gap: 8 },
  starters: { alignSelf: 'stretch', alignItems: 'flex-end', gap: 10, marginTop: 16 },
  starter: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  starterText: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  mine: { alignItems: 'flex-end' },
  theirs: { alignItems: 'flex-start', gap: 6 },
  momoBubble: { ...bubble, backgroundColor: colors.surface },
  userBubble: { ...bubble },
  userText: { color: '#FFFFFF' },
  failure: { backgroundColor: '#FDECEA', borderRadius: 16, padding: 14, gap: 10 },
  failureText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, color: '#8C1D18' },
  failureQuote: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19, color: '#8C1D18' },
  failureActions: { flexDirection: 'row', gap: 22 },
  failureLink: { fontFamily: fonts.semibold, fontSize: 15, color: '#8C1D18', textDecorationLine: 'underline' },
  disclaimer: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textFaint,
    textAlign: 'center',
    paddingHorizontal: 28,
    paddingTop: 6,
  },
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    maxHeight: 140,
    borderRadius: 30,
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    paddingTop: 19,
    paddingBottom: 19,
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.text,
  },
});
