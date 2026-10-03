import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { Screen } from '@/components/screen';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { bookApi } from '@/services/book-api';
import type { Book, BookCategory } from '@/types/book';

type SearchBy = 'title' | 'author';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ categoryId?: string; sort?: string }>();
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('title');
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(-1);
  const categoryId = Number(params.categoryId) || undefined;
  useFocusEffect(useCallback(() => { setLoading(true); setPage(1); setBooks([]); setReload((value) => value + 1); }, []));
  useEffect(() => {
    if (reload < 0) return;
    let active = true;
    bookApi.categories().then((items) => { if (active) setCategories(items.filter((item) => item.booksCount > 0)); }).catch(() => {});
    return () => { active = false; };
  }, [reload]);
  useEffect(() => {
    if (reload < 0) return;
    let active = true;
    const timer = setTimeout(() => {
      bookApi.list({ page, categoryId, query, searchBy, sort: params.sort === 'popular' ? 'popular' : 'newest' })
        .then((result) => {
          if (!active) return;
          setBooks((current) => page === 1 ? result.books : [...current, ...result.books]);
          setTotal(result.total);
          setLastPage(result.lastPage);
          setError('');
        })
        .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Không tải được sách.'); })
        .finally(() => { if (active) setLoading(false); });
    }, query.trim() ? 300 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [page, categoryId, query, searchBy, params.sort, reload]);
  const setCategory = (value?: number) => { setLoading(true); setPage(1); setBooks([]); router.setParams({ categoryId: value ? String(value) : '' }); };

  return (
    <Screen>
      <Text style={styles.kicker}>THƯ VIỆN MỞ</Text>
      <Text style={styles.title}>Bạn muốn đọc gì?</Text>
      <Text style={styles.searchLabel}>Tìm kiếm theo</Text>
      <View style={styles.searchModes}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: searchBy === 'title' }}
          onPress={() => { setLoading(true); setPage(1); setBooks([]); setSearchBy('title'); }}
          style={[styles.searchMode, searchBy === 'title' && styles.searchModeActive]}
        >
          <Text style={[styles.searchModeText, searchBy === 'title' && styles.searchModeTextActive]}>Tên sách</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: searchBy === 'author' }}
          onPress={() => { setLoading(true); setPage(1); setBooks([]); setSearchBy('author'); }}
          style={[styles.searchMode, searchBy === 'author' && styles.searchModeActive]}
        >
          <Text style={[styles.searchModeText, searchBy === 'author' && styles.searchModeTextActive]}>Tác giả</Text>
        </Pressable>
      </View>
      <View style={styles.searchBox}>
        <AppIcon name="search" size={24} color={colors.inkSoft} />
        <TextInput
          accessibilityLabel={searchBy === 'title' ? 'Tìm theo tên sách' : 'Tìm theo tác giả'}
          value={query}
          onChangeText={(value) => { setLoading(true); setPage(1); setBooks([]); setQuery(value); }}
          placeholder={searchBy === 'title' ? 'Nhập tên sách...' : 'Nhập tên tác giả...'}
          placeholderTextColor="#858C86"
          style={styles.input}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query ? <Pressable accessibilityLabel="Xóa từ khóa tìm kiếm" onPress={() => { setLoading(true); setPage(1); setBooks([]); setQuery(''); }}><AppIcon name="close" color={colors.inkSoft} /></Pressable> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {[{ id: 0, name: 'Tất cả', booksCount: 0 }, ...categories].map((item) => (
          <Pressable key={item.id} onPress={() => setCategory(item.id || undefined)} style={[styles.filter, (categoryId ?? 0) === item.id && styles.filterActive]}>
            <Text style={[styles.filterText, (categoryId ?? 0) === item.id && styles.filterTextActive]}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>{query.trim() ? `Kết quả theo ${searchBy === 'title' ? 'tên sách' : 'tác giả'}` : params.sort === 'popular' ? 'Sách xem nhiều' : 'Tất cả sách'}</Text>
        <Text style={styles.count}>{total} sách</Text>
      </View>

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.moss} />
          <Text style={styles.emptyText}>Đang tải sách...</Text>
        </View>
        
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => {setLoading(true); setReload((value) => value + 1);}}><Text style={styles.retryText}>Thử lại</Text></Pressable>
        </View>
      ) : null}

      {books.map((book) => (
        <Pressable
          key={book.id}
          onPress={() => router.push(`/book/${book.id}`)}
          style={({ pressed }) => [styles.result, pressed && styles.pressed]}
        >
          <BookCover book={book} width={76} elevated={false} />
          <View style={styles.resultBody}>
            <Text style={styles.bookCategory}>{book.category.toUpperCase()}</Text>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.author}>bởi {book.author}</Text>
            <View style={styles.stats}>
              <Text style={styles.time}>{book.chaptersCount} chương</Text>
            </View>
          </View>
          <AppIcon name="chevron" color={colors.inkSoft} />
        </Pressable>
      ))}

      {!books.length && !loading && !error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⌕</Text>
          <Text style={styles.emptyTitle}>Chưa tìm thấy cuốn sách phù hợp</Text>
          <Text style={styles.emptyText}>
            Thử tên {searchBy === 'title' ? 'sách' : 'tác giả'} khác hoặc đổi chủ đề nhé.
          </Text>
        </View>
      ) : null}

      {!books.length && !loading && !error ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.emptyTitle}>Chưa tìm thấy cuốn sách phù hợp</Text><Text style={styles.emptyText}>Thử tên {searchBy === 'title' ? 'sách' : 'tác giả'} khác hoặc đổi chủ đề nhé.</Text></View>
      ) : null}
      {page < lastPage && !error ? <Pressable disabled={loading} onPress={() => { setLoading(true); setPage((value) => value + 1); }} style={styles.filter}><Text style={styles.filterText}>{loading ? 'Đang tải...' : 'Xem thêm sách'}</Text></Pressable> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 32, fontWeight: '700', marginTop: 7 },
  searchLabel: { color: colors.inkSoft, fontSize: 12, fontWeight: '700', marginTop: 22, marginBottom: 9 },
  searchModes: { flexDirection: 'row', gap: 9 },
  searchMode: { flex: 1, height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  searchModeActive: { backgroundColor: colors.moss, borderColor: colors.moss },
  searchModeText: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  searchModeTextActive: { color: colors.white },
  searchBox: { marginTop: 14, height: 54, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
  input: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 10 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 9 },
  filter: { height: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 19, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
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
  emptyText: { color: colors.inkSoft, fontSize: 17, marginTop: 7 },
  loadingContainer: {flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.paper, paddingTop: 120 },
  retryButton: { backgroundColor: colors.moss, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.md },
  retryText: { color: colors.paper, fontSize: 14, fontWeight: "700" },
});
