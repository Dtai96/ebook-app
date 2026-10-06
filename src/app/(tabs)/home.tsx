import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View , ActivityIndicator} from 'react-native';
import { Image } from 'expo-image';

import { BookCard } from '@/components/book/book-card';
import { BookCover } from '@/components/book/book-cover';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii, shadows } from '@/constants/theme';
import { bookApi } from '@/services/book-api';
import { useAppStore } from '@/store/app-store';
import type { Book, BookCategory } from '@/types/book';

export default function HomeScreen() {
  const { progress, user } = useAppStore();
  const recentBookId = Object.entries(progress).sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]?.[0];
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(-1);
  useFocusEffect(useCallback(() => { setLoading(true); setReload((value) => value + 1); }, []));
  useEffect(() => {
    if (reload < 0) return;
    let active = true;
    Promise.all([bookApi.home(), recentBookId ? bookApi.detail(recentBookId).catch(() => null) : Promise.resolve(null)])
      .then(([home, reading]) => {
        if (!active) return;
        setNewBooks(home.newBooks);
        setPopularBooks(home.popularBooks);
        setCategories(home.categories.filter((item) => item.booksCount > 0));
        setCurrentBook(reading);
        setError('');
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Không tải được sách.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [recentBookId, reload]);
  const currentProgress = currentBook ? progress[currentBook.id] : null;
  const currentChapter = currentBook?.chapters.find((chapter) => chapter.id === currentProgress?.chapterId);
  const firstName = user?.name.trim().split(' ').slice(-1)[0] ?? 'bạn';
  return (
    <Screen>
      <View style={styles.topbar}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.eyebrow}>{new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' }).toUpperCase()}</Text>
          <Text style={styles.greeting}>Chào {firstName}</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>{user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} contentFit="cover" style={styles.avatarImage} /> : <Text style={styles.avatarText}>{user?.initials ?? 'MT'}</Text>}</Pressable>
      </View>

      <Pressable onPress={() => router.push('/(tabs)/search')} style={styles.search}>
        <AppIcon name="search" size={24} color={colors.inkSoft} />
        <Text style={styles.searchText}>Tìm tên sách, tác giả...</Text>
      </Pressable>

      
      <View style={styles.heroHeader}>
        <View>
          <Text style={styles.heroKicker}>{currentChapter ? 'ĐỌC TIẾP' : 'BẮT ĐẦU ĐỌC'}</Text>
          <Text style={styles.heroTitle}>Một khoảng lặng{`\n`}dành cho bạn.</Text>
        </View>
      </View>

      {currentBook && currentProgress && currentChapter ? <Pressable onPress={() => router.push(`/reader/${currentProgress.chapterId}`)} style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
        <BookCover book={currentBook} width={92} elevated={false} />
        <View style={styles.continueContent}>
          <Text style={styles.continueCategory}>CHƯƠNG {currentChapter.number}</Text>
          <Text numberOfLines={2} style={styles.continueTitle}>{currentBook.title}</Text>
          <Text numberOfLines={1} style={styles.chapter}>{currentChapter.title}</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${currentProgress.percent}%` }]} /></View>
          <View style={styles.progressMeta}><Text style={styles.progressText}>{currentProgress.percent}% chương hiện tại</Text><View style={styles.play}><AppIcon name="play" size={13} color={colors.white} /></View></View>
        </View>
      </Pressable> : !loading && !error ? <Pressable onPress={() => router.push('/(tabs)/search')} style={styles.continueCard}><Text style={styles.continueTitle}>Chọn một cuốn sách để bắt đầu đọc</Text></Pressable> : null}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.moss} />
          <Text style={styles.status}>Đang tải sách...</Text>
        </View>
      ) : error ? (
      <View style={styles.loadingContainer}>
        <Text style={styles.status}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => { setLoading(true); setReload((value) => value + 1); }}><Text style={styles.retryText}>Thử lại</Text></Pressable>
      </View>) : null}
      
      {!loading && !error ? (
        <>
        <View style={styles.section}>
          <SectionHeader title="Khám phá theo chủ đề" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((category) => (
              <Pressable key={category.id} onPress={() => router.push({ pathname: '/(tabs)/search', params: { categoryId: String(category.id) } })} style={styles.category}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Xem nhiều" action="Xem tất cả" onAction={() => router.push({ pathname: '/(tabs)/search', params: { sort: 'popular' } })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>
            {popularBooks.map((book) => <BookCard key={book.id} book={book} />)}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Mới trên Mộc Thư" action="Khám phá" onAction={() => router.push('/(tabs)/search')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>
            {newBooks.map((book) => <BookCard key={book.id} book={book} />)}
          </ScrollView>
        </View>

        {!loading && !error && !newBooks.length ? <Text style={styles.status}>Chưa có sách trong thư viện. Hãy nhập sách ở backend trước.</Text> : null}
        </>
      ) : null}
      
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.paper, paddingTop: 150 },
  status: { color: colors.inkSoft, paddingVertical: 16, fontSize: 17 },
  retryButton: { backgroundColor: colors.moss, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.md },
  retryText: { color: colors.paper, fontSize: 14, fontWeight: "700" },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginBottom: 22 },
  eyebrow: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  greeting: { color: colors.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.6, marginTop: 5 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  search: { height: 52, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 },
  searchText: { color: '#7C837D', fontSize: 15 },
  heroHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 30, marginBottom: 15 },
  heroKicker: { color: colors.moss, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 7 },
  heroTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 29, lineHeight: 34, fontWeight: '700' },
  streak: { width: 55, height: 55, borderRadius: 28, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  streakNumber: { color: colors.ink, fontWeight: '800', fontSize: 17, lineHeight: 18 },
  streakLabel: { color: colors.inkSoft, fontSize: 9 },
  continueCard: { ...shadows.card, backgroundColor: colors.mossDark, borderRadius: radii.lg, padding: 14, flexDirection: 'row', gap: 16 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  continueContent: { flex: 1, paddingVertical: 4 },
  continueCategory: { color: '#BFD0C5', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  continueTitle: { color: colors.white, fontFamily: 'serif', fontSize: 20, lineHeight: 24, fontWeight: '700', marginTop: 8 },
  chapter: { color: '#D3DDD6', fontSize: 11, marginTop: 5 },
  progressTrack: { height: 4, backgroundColor: '#527363', borderRadius: 2, marginTop: 15, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 2 },
  progressMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 },
  progressText: { color: '#C5D1C9', fontSize: 10 },
  play: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  section: { marginTop: 32 },
  categoryRow: { gap: 9, paddingRight: 10 },
  category: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 10 },
  categoryActive: { backgroundColor: colors.moss, borderColor: colors.moss },
  categoryText: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: colors.white },
  bookRow: { paddingRight: 6 },
  quote: { backgroundColor: '#E9DDC7', borderRadius: radii.lg, marginTop: 34, padding: 24, alignItems: 'center' },
  quoteMark: { color: colors.coral, fontFamily: 'serif', fontSize: 52, lineHeight: 44 },
  quoteText: { color: colors.ink, fontFamily: 'serif', fontSize: 19, lineHeight: 27, textAlign: 'center', maxWidth: 280 },
  quoteAuthor: { color: colors.inkSoft, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 15 },
});
