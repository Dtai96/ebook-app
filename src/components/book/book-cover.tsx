import { StyleSheet, Text, View } from 'react-native';

import { radii, shadows } from '@/constants/theme';
import { Book } from '@/types/book';

export function BookCover({ book, width = 112, elevated = true }: { book: Book; width?: number; elevated?: boolean }) {
  const height = Math.round(width * 1.46);
  return (
    <View style={[styles.cover, elevated && shadows.card, { width, height, backgroundColor: book.coverColor, borderRadius: width > 100 ? radii.md : radii.sm }]}>
      <View style={[styles.sun, { backgroundColor: book.accentColor, width: width * 0.7, height: width * 0.7, borderRadius: width }]} />
      <View style={[styles.spine, { backgroundColor: book.accentColor }]} />
      <Text style={[styles.mark, { color: book.accentColor, fontSize: width * 0.36 }]}>{book.coverMark}</Text>
      <Text numberOfLines={2} style={[styles.title, { fontSize: Math.max(10, width * 0.105) }]}>{book.title.toUpperCase()}</Text>
      <Text style={[styles.author, { fontSize: Math.max(8, width * 0.075) }]}>{book.author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { overflow: 'hidden', padding: 12, justifyContent: 'flex-end' },
  sun: { position: 'absolute', top: -18, right: -20, opacity: 0.18 },
  spine: { position: 'absolute', width: 3, top: 0, bottom: 0, left: 8, opacity: 0.7 },
  mark: { position: 'absolute', top: '24%', alignSelf: 'center', fontFamily: 'serif', fontWeight: '600', opacity: 0.95 },
  title: { color: '#FFFDF8', fontWeight: '800', letterSpacing: 0.6, lineHeight: 16 },
  author: { color: '#FFFDF8', opacity: 0.74, marginTop: 5, letterSpacing: 0.4 },
});
