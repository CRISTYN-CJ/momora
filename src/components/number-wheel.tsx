import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { colors, fonts, type, type StageTheme } from '@/theme';

type Props = {
  value?: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** Shown faintly until the user first scrolls or taps. */
  initial: number;
  unit: string;
  theme: StageTheme;
};

const ITEM = 128;
const HEIGHT = 176;

/** Horizontal number picker: scroll or tap a number to centre it in the frame. */
export function NumberWheel({ value, onChange, min, max, initial, unit, theme }: Props) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(0);
  const untouched = value === undefined;
  const shown = value ?? initial;
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  // Ignore scroll events caused by our own initial positioning.
  const userScrolling = useRef(false);

  useEffect(() => {
    if (width) scroll.current?.scrollTo({ x: (shown - min) * ITEM, animated: false });
    // Position once per layout; later changes come from the user's own scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!userScrolling.current) return;
    const next = Math.min(max, Math.max(min, min + Math.round(e.nativeEvent.contentOffset.x / ITEM)));
    if (next !== value) onChange(next);
  };

  const select = (n: number) => {
    scroll.current?.scrollTo({ x: (n - min) * ITEM, animated: true });
    onChange(n);
  };

  const side = Math.max(0, (width - ITEM) / 2);

  return (
    <View style={styles.wrap}>
      <View style={styles.wheel} onLayout={onLayout}>
        <View
          pointerEvents="none"
          style={[styles.frame, { left: side, borderColor: untouched ? theme.tint : theme.bubble }]}
        />
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScrollBeginDrag={() => (userScrolling.current = true)}
          onScroll={onScroll}
          contentContainerStyle={{ paddingHorizontal: side }}
          accessibilityRole="adjustable"
          accessibilityValue={{ min, max, now: shown, text: `${shown} ${unit}` }}>
          {numbers.map((n) => {
            const active = n === shown;
            return (
              <Pressable key={n} onPress={() => select(n)} style={styles.item}>
                <Text style={[styles.number, (!active || untouched) && styles.inactive]}>{n}</Text>
                <Text style={[styles.unit, (!active || untouched) && styles.inactive]}>{unit}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <Text style={[type.label, !untouched && styles.hidden]}>Adjust slider to select</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14 },
  wheel: { alignSelf: 'stretch', height: HEIGHT, justifyContent: 'center' },
  frame: { position: 'absolute', top: 0, width: ITEM, height: HEIGHT, borderRadius: 26, borderWidth: 4 },
  item: { width: ITEM, height: HEIGHT, alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: fonts.semibold, fontSize: 68, lineHeight: 74, color: colors.text },
  unit: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text },
  inactive: { color: '#D2D2D2' },
  hidden: { opacity: 0 },
});
