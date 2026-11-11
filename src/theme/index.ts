import type { TextStyle } from 'react-native';

export type Stage = 'ttc' | 'pregnancy' | 'postdelivery';

export type StageTheme = {
  /** Primary action colour (Send button, selected states). */
  accent: string;
  /** The user's chat bubble. */
  bubble: string;
  /** Selected reply chip. */
  selectedBg: string;
  selectedBorder: string;
  /** Soft tint used in gradients and progress fills. */
  tint: string;
  /** Welcome screen gradient, top to bottom. */
  welcome: [string, string, string];
};

export const stageThemes: Record<Stage, StageTheme> = {
  ttc: {
    accent: '#AE1FC6',
    bubble: '#EF7BF6',
    selectedBg: '#FCEBFE',
    selectedBorder: '#F2A5F7',
    tint: '#F6B8FA',
    welcome: ['rgba(203,133,220,0)', '#B66CCB', '#2B0A35'],
  },
  pregnancy: {
    accent: '#0A72DF',
    bubble: '#57AEF4',
    selectedBg: '#DEEFFE',
    selectedBorder: '#6CB6F6',
    tint: '#A9D4FA',
    welcome: ['rgba(63,143,217,0)', '#2F86D6', '#093C78'],
  },
  postdelivery: {
    accent: '#05A3DF',
    bubble: '#12B8EF',
    selectedBg: '#D9F3FC',
    selectedBorder: '#97DEF5',
    tint: '#A5E4F8',
    welcome: ['rgba(56,165,240,0)', '#2F9DEC', '#0868D6'],
  },
};

/** Used before the user has picked a stage. */
export const neutralTheme: StageTheme = {
  accent: '#000000',
  bubble: '#111111',
  selectedBg: '#F1F1F1',
  selectedBorder: '#111111',
  tint: '#D9D9D9',
  welcome: ['rgba(0,0,0,0)', '#444444', '#000000'],
};

export function themeFor(stage?: string | null): StageTheme {
  return stage && stage in stageThemes ? stageThemes[stage as Stage] : neutralTheme;
}

export const colors = {
  background: '#FFFFFF',
  text: '#0B0B0B',
  textMuted: '#6F6F6F',
  textFaint: '#A8A8A8',
  surface: '#EDEDED',
  surfaceAlt: '#F5F5F5',
  border: '#D6D6D6',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const type = {
  title: { fontFamily: fonts.medium, fontSize: 28, lineHeight: 36, color: colors.text },
  heading: { fontFamily: fonts.medium, fontSize: 24, lineHeight: 30, color: colors.text },
  body: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 24, color: colors.text },
  chip: { fontFamily: fonts.medium, fontSize: 19, lineHeight: 24, color: colors.text },
  label: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20, color: colors.textMuted },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.textFaint },
} satisfies Record<string, TextStyle>;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { pill: 999, bubble: 26, card: 22 };
