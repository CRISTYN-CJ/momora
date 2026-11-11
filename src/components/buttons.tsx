import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, type, type StageTheme } from '@/theme';

import { Icon, type IconName } from './icon';

type PillProps = {
  label: string;
  onPress: () => void;
  color: string;
  disabled?: boolean;
  icon?: IconName;
  wide?: boolean;
};

/** Filled pill: Send, "I'm in, let's go", "Yes, let's continue". */
export function PillButton({ label, onPress, color, disabled, icon = 'chevronRight', wide }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        wide && styles.pillWide,
        { backgroundColor: color, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
      ]}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Icon name={icon} size={16} color="#FFFFFF" strokeWidth={2.4} />
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}>
      <Icon name="chevronLeft" size={20} color="#4A4A4A" strokeWidth={2.4} />
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: StageTheme;
};

/** A tappable reply option. */
export function ReplyChip({ label, selected, onPress, theme }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: theme.selectedBg, borderColor: theme.selectedBorder },
        pressed && { opacity: 0.8 },
      ]}>
      <Text style={type.chip}>{label}</Text>
    </Pressable>
  );
}

export function ChipList({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipList}>{children}</View>;
}

const styles = StyleSheet.create({
  pill: {
    height: 60,
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pillWide: { alignSelf: 'stretch' },
  pillLabel: { fontFamily: fonts.medium, fontSize: 18, color: '#FFFFFF' },
  back: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  chipList: { alignItems: 'flex-end', gap: 12 },
});
