import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { colors } from '@/constants/theme';
import { Book } from '@/types/book';
import { BookCover } from './book-cover';

export function BookCard({ book }: { book: Book }) {
  return (
    <Pressable onPress={() => router.push(`/book/${book.id}`)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <BookCover book={book} width={112} />
      <Text numberOfLines={2} style={styles.title}>{book.title}</Text>
      <Text numberOfLines={1} style={styles.author}>{book.author}</Text>
      <View style={styles.meta}><Text style={styles.star}>★</Text><Text style={styles.rating}>{book.rating}</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 128, marginRight: 14 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  title: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '700', marginTop: 11 },
  author: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  meta: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 7 },
  star: { color: colors.gold, fontSize: 12 },
  rating: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
});
