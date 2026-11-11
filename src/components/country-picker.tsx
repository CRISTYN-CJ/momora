import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { COUNTRIES } from '@/onboarding/countries';
import { colors, fonts } from '@/theme';

import { Icon } from './icon';

type Props = { value?: string; onChange: (country: string) => void };

export function CountryPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const matches = needle ? COUNTRIES.filter((c) => c.toLowerCase().includes(needle)) : COUNTRIES;

  return (
    <View style={styles.wrap}>
      <View style={styles.search}>
        <Icon name="search" size={22} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search country"
          placeholderTextColor={colors.textFaint}
          autoCorrect={false}
          style={styles.input}
          accessibilityLabel="Search country"
        />
      </View>
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        {matches.map((country) => {
          const selected = country === value;
          return (
            <Pressable
              key={country}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(country)}
              style={[styles.row, selected && styles.rowSelected]}>
              <View style={styles.check}>{selected && <Icon name="check" size={18} strokeWidth={2.4} />}</View>
              <Text style={styles.country}>{country}</Text>
            </Pressable>
          );
        })}
        {matches.length === 0 && <Text style={styles.empty}>No country matches “{query.trim()}”.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.medium, fontSize: 19, color: colors.text, height: '100%' },
  list: { height: 230 },
  row: { flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 10, paddingHorizontal: 14 },
  rowSelected: { backgroundColor: colors.surface },
  check: { width: 30 },
  country: { fontFamily: fonts.medium, fontSize: 20, color: colors.text },
  empty: { fontFamily: fonts.regular, fontSize: 16, color: colors.textMuted, padding: 14 },
});
