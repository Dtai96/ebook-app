import { StyleSheet, Text } from 'react-native';

const glyphs: Record<string, string> = {
  home: '⌂', search: '⌕', library: '▤', profile: '●', back: '‹', heart: '♡', heartFill: '♥',
  bookmark: '♧', bookmarkFill: '♣', play: '▶', pause: 'Ⅱ', settings: 'Aa', more: '•••',
  chevron: '›', close: '×', spark: '✦', previous: '↶', next: '↷', moon: '◐', check: '✓',
};

export function AppIcon({ name, size = 22, color = '#17201B' }: { name: keyof typeof glyphs; size?: number; color?: string }) {
  return <Text style={[styles.icon, { fontSize: size, color }]}>{glyphs[name]}</Text>;
}

const styles = StyleSheet.create({ icon: { lineHeight: 28, textAlign: 'center', fontWeight: '700' } });
