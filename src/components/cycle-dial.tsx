import { StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors, fonts, type, type StageTheme } from '@/theme';

type Props = {
  value?: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** Shown faintly until the user first moves the knob. */
  initial: number;
  unit: string;
  theme: StageTheme;
};

const SIZE = 320;
const STROKE = 30;
const R = (SIZE - STROKE) / 2;
const C = SIZE / 2;

/**
 * Circular slider laid out like a clock face: one full turn is
 * `2 × (max − min)`, so with 14–42 days, 14 sits at 3 o'clock, 28 at
 * 6 o'clock and 42 at 9 o'clock.
 */
export function CycleDial({ value, onChange, min, max, initial, unit, theme }: Props) {
  const turn = (max - min) * 2;
  const shown = value ?? initial;
  const untouched = value === undefined;
  const angle = (shown / turn) * 2 * Math.PI;

  const point = (a: number, r = R) => ({ x: C + r * Math.sin(a), y: C - r * Math.cos(a) });
  const knob = point(angle);
  const arcStart = point(0);
  const arc = `M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 ${angle > Math.PI ? 1 : 0} 1 ${knob.x} ${knob.y}`;

  function handle(e: GestureResponderEvent) {
    const { locationX, locationY } = e.nativeEvent;
    let a = Math.atan2(locationX - C, C - locationY);
    if (a < 0) a += 2 * Math.PI;
    onChange(Math.min(max, Math.max(min, Math.round((a / (2 * Math.PI)) * turn))));
  }

  const ticks = Array.from({ length: 24 }, (_, i) => point((i / 24) * 2 * Math.PI, R - STROKE - 6));
  const quarter = (max - min) / 2;

  return (
    <View
      style={styles.wrap}
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: shown, text: `${shown} ${unit}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onChange(Math.min(max, Math.max(min, shown + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))
      }>
      <View
        style={styles.dial}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={handle}
        onResponderMove={handle}>
        <Svg width={SIZE} height={SIZE} pointerEvents="none" style={untouched && styles.dim}>
          <Defs>
            <LinearGradient id="dialFill" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor={theme.tint} />
              <Stop offset="1" stopColor={theme.bubble} />
            </LinearGradient>
          </Defs>
          <Circle cx={C} cy={C} r={R} stroke={colors.surface} strokeWidth={STROKE} fill="none" />
          <Path d={arc} stroke="url(#dialFill)" strokeWidth={STROKE} strokeLinecap="round" fill="none" />
          {ticks.map((t, i) => (
            <Circle key={i} cx={t.x} cy={t.y} r={i === 0 ? 4 : 3} fill={i === 0 ? theme.bubble : '#E3E3E3'} />
          ))}
          <Circle cx={knob.x} cy={knob.y} r={STROKE - 2} fill="#FFFFFF" stroke="#E4E4E4" strokeWidth={1} />
        </Svg>

        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.side, styles.left]}>{min + quarter * 2}</Text>
          <Text style={[styles.side, styles.right]}>{min}</Text>
          <Text style={[styles.side, styles.bottom]}>{min + quarter}</Text>
          <View style={untouched && styles.dim}>
            <Text style={styles.value}>{shown}</Text>
            <Text style={styles.unit}>{unit}</Text>
          </View>
        </View>
      </View>
      <Text style={[type.label, !untouched && styles.hidden]}>Adjust slider to select</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  dial: { width: SIZE, height: SIZE },
  dim: { opacity: 0.35 },
  hidden: { opacity: 0 },
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: fonts.semibold, fontSize: 72, lineHeight: 76, color: colors.text, textAlign: 'center' },
  unit: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text, textAlign: 'center' },
  side: { position: 'absolute', fontFamily: fonts.medium, fontSize: 15, color: colors.textFaint },
  left: { left: STROKE + 22 },
  right: { right: STROKE + 22 },
  bottom: { bottom: STROKE + 22 },
});
