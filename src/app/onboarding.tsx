import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, ChipList, PillButton, ReplyChip } from '@/components/buttons';
import { CalendarPicker } from '@/components/calendar-picker';
import { MomoMessage, TypingIndicator, UserMessage } from '@/components/chat';
import { CountryPicker } from '@/components/country-picker';
import { CycleDial } from '@/components/cycle-dial';
import { NumberWheel } from '@/components/number-wheel';
import { labelFor, visibleQuestions } from '@/onboarding/flow';
import { useProfile } from '@/onboarding/profile';
import type { AnswerValue, Question } from '@/onboarding/types';
import { colors, fonts, themeFor, type, type StageTheme } from '@/theme';

/** How long Momo "types" between questions. */
const TYPING_MS = 900;

export default function Onboarding() {
  const { answers, setAnswer } = useProfile();
  const questions = visibleQuestions(answers);

  const [currentId, setCurrentId] = useState(questions[0].id);
  const [draft, setDraft] = useState<AnswerValue | undefined>(answers[questions[0].id]);
  const [typing, setTyping] = useState(false);

  const index = Math.max(0, questions.findIndex((q) => q.id === currentId));
  const question = questions[index];
  const previous = index > 0 ? questions[index - 1] : undefined;

  // The stage chips preview their colour before the answer is sent.
  const theme = themeFor(String(question.id === 'stage' ? (draft ?? '') : (answers.stage ?? '')));

  const goTo = (next: Question) => {
    setCurrentId(next.id);
    setDraft(answers[next.id]);
  };

  // After an answer is sent: show it as a bubble while Momo types, then move on.
  useEffect(() => {
    if (!typing) return;
    const timer = setTimeout(() => {
      setTyping(false);
      const next = questions[index + 1];
      if (next) goTo(next);
      else router.replace('/summary');
    }, TYPING_MS);
    return () => clearTimeout(timer);
    // `questions` already reflects the answer that was just saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing]);

  const canSend = draft !== undefined && String(draft).trim() !== '' && !typing;

  const send = () => {
    if (!canSend) return;
    const value = typeof draft === 'string' ? draft.trim() : draft;
    setDraft(value);
    setAnswer(question.id, value);
    setTyping(true);
  };

  const back = () => {
    if (typing) return;
    if (previous) goTo(previous);
    else router.back();
  };

  const isText = question.input.kind === 'text';

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.chat}>
            {previous && !typing && (
              <UserMessage faded text={labelFor(previous.id, answers[previous.id])} color={theme.bubble} />
            )}
            <MomoMessage lines={question.prompts(answers)} />
            {typing && (
              <>
                <UserMessage text={labelFor(question.id, draft)} color={theme.bubble} />
                <TypingIndicator />
              </>
            )}
          </View>

          {!typing && !isText && (
            <View style={styles.input}>
              {question.helper && <Text style={type.label}>{question.helper}</Text>}
              <AnswerInput question={question} value={draft} onChange={setDraft} theme={theme} />
            </View>
          )}
        </ScrollView>

        <View style={styles.bar}>
          {(!isText || index > 0) && <BackButton onPress={back} />}
          {isText && question.input.kind === 'text' ? (
            <TextInput
              key={question.id}
              autoFocus
              value={typeof draft === 'string' ? draft : ''}
              onChangeText={setDraft}
              onSubmitEditing={send}
              editable={!typing}
              placeholder={question.input.placeholder}
              placeholderTextColor={colors.textFaint}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="send"
              maxLength={40}
              style={styles.textField}
              accessibilityLabel={question.input.placeholder}
            />
          ) : (
            <View style={styles.flex} />
          )}
          <PillButton label="Send" color={theme.accent} disabled={!canSend} onPress={send} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AnswerInputProps = {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue | undefined) => void;
  theme: StageTheme;
};

/** Picks the right control for the question's input type. */
function AnswerInput({ question, value, onChange, theme }: AnswerInputProps) {
  const input = question.input;
  switch (input.kind) {
    case 'choice': {
      const isOption = input.options.some((o) => o.value === value);
      return (
        <ChipList>
          {input.options.map((option) => (
            <ReplyChip
              key={option.value}
              label={option.label}
              selected={value === option.value}
              onPress={() => onChange(option.value)}
              theme={theme}
            />
          ))}
          {input.other && (
            <TextInput
              value={!isOption && typeof value === 'string' ? value : ''}
              onChangeText={(text) => onChange(text || undefined)}
              placeholder={input.other}
              placeholderTextColor={colors.textFaint}
              multiline={input.otherMultiline}
              maxLength={input.otherMultiline ? 400 : 60}
              style={[styles.other, input.otherMultiline && styles.otherMultiline]}
              accessibilityLabel={input.other}
            />
          )}
        </ChipList>
      );
    }
    case 'date':
      return (
        <CalendarPicker
          value={typeof value === 'string' ? value : undefined}
          onChange={onChange}
          range={input.range}
          theme={theme}
        />
      );
    case 'dial':
      return <CycleDial {...input} value={typeof value === 'number' ? value : undefined} onChange={onChange} theme={theme} />;
    case 'wheel':
      return (
        <NumberWheel {...input} value={typeof value === 'number' ? value : undefined} onChange={onChange} theme={theme} />
      );
    case 'country':
      return <CountryPicker value={typeof value === 'string' ? value : undefined} onChange={onChange} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, gap: 28 },
  chat: { gap: 18 },
  input: { gap: 14, paddingBottom: 20 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  textField: {
    flex: 1,
    minWidth: 0,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    fontFamily: fonts.medium,
    fontSize: 19,
    color: colors.text,
  },
  other: {
    alignSelf: 'stretch',
    minHeight: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 14,
    fontFamily: fonts.medium,
    fontSize: 19,
    color: colors.text,
  },
  otherMultiline: { minHeight: 96, borderRadius: 24, textAlignVertical: 'top', lineHeight: 26 },
});
