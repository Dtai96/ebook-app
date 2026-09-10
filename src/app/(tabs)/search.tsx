import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { Screen } from '@/components/screen';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { books, categories } from '@/data/books';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(params.category ?? 'Tất cả');
  const filtered = useMemo(() => books.filter((book) => {
    const matchesQuery = `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === 'Tất cả' || book.category === category);
  }), [category, query]);

  return (
    <Screen>
      <Text style={styles.kicker}>THƯ VIỆN MỞ</Text>
      <Text style={styles.title}>Bạn muốn đọc gì?</Text>
      <View style={styles.searchBox}>
        <AppIcon name="search" size={24} color={colors.inkSoft} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Tên sách hoặc tác giả" placeholderTextColor="#858C86" style={styles.input} autoCapitalize="none" />
        {query ? <Pressable onPress={() => setQuery('')}><AppIcon name="close" color={colors.inkSoft} /></Pressable> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filter, category === item && styles.filterActive]}>
            <Text style={[styles.filterText, category === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>{query ? 'Kết quả tìm kiếm' : 'Sách dành cho bạn'}</Text>
        <Text style={styles.count}>{filtered.length} sách</Text>
      </View>
      {filtered.length ? filtered.map((book) => (
        <Pressable key={book.id} onPress={() => router.push(`/book/${book.id}`)} style={({ pressed }) => [styles.result, pressed && styles.pressed]}>
          <BookCover book={book} width={76} elevated={false} />
          <View style={styles.resultBody}>
            <Text style={styles.bookCategory}>{book.category.toUpperCase()}</Text>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.author}>bởi {book.author}</Text>
            <View style={styles.stats}><Text style={styles.star}>★ {book.rating}</Text><Text style={styles.dot}>•</Text><Text style={styles.time}>{book.readTime}</Text></View>
          </View>
          <AppIcon name="chevron" color={colors.inkSoft} />
        </Pressable>
      )) : (
        <View style={styles.empty}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.emptyTitle}>Chưa tìm thấy cuốn sách phù hợp</Text><Text style={styles.emptyText}>Thử một từ khóa hoặc chủ đề khác nhé.</Text></View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 32, fontWeight: '700', marginTop: 7 },
  searchBox: { marginTop: 22, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
  input: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 10 },
  filters: { gap: 9, paddingVertical: 18 },
  filter: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filterActive: { backgroundColor: colors.moss, borderColor: colors.moss },
  filterText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.white },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7, marginBottom: 4 },
  resultTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  count: { color: colors.inkSoft, fontSize: 12 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { opacity: 0.65 },
  resultBody: { flex: 1 },
  bookCategory: { color: colors.coral, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  bookTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: 4 },
  author: { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  stats: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 9 },
  star: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  dot: { color: colors.border },
  time: { color: colors.inkSoft, fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyIcon: { color: colors.sage, fontSize: 52 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: 12 },
  emptyText: { color: colors.inkSoft, fontSize: 13, marginTop: 7 },
});
