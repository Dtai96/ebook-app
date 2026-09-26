import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BookCard } from '@/components/book/book-card';
import { BookCover } from '@/components/book/book-cover';
import { Screen } from '@/components/screen';
import { SectionHeader } from '@/components/section-header';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii, shadows } from '@/constants/theme';
import { books, categories } from '@/data/books';
import { useAppStore } from '@/store/app-store';

export default function HomeScreen() {
  const { progress, user } = useAppStore();
  const recentBookId = Object.entries(progress).sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]?.[0];
  const currentBook = books.find((book) => book.id === recentBookId) ?? books[0];
  const currentProgress = progress[currentBook.id] ?? { chapterId: currentBook.chapters[0].id, percent: 0 };
  const currentChapter = currentBook.chapters.find((chapter) => chapter.id === currentProgress.chapterId) ?? currentBook.chapters[0];
  const firstName = user?.name.trim().split(' ').slice(-1)[0] ?? 'bạn';
  return (
    <Screen>
      <View style={styles.topbar}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.eyebrow}>{new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' }).toUpperCase()}</Text>
          <Text style={styles.greeting}>Chào {firstName}</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}><Text style={styles.avatarText}>{user?.initials ?? 'MT'}</Text></Pressable>
      </View>

      <Pressable onPress={() => router.push('/(tabs)/search')} style={styles.search}>
        <AppIcon name="search" size={24} color={colors.inkSoft} />
        <Text style={styles.searchText}>Tìm tên sách, tác giả...</Text>
      </Pressable>

      <View style={styles.heroHeader}>
        <View>
          <Text style={styles.heroKicker}>ĐỌC TIẾP</Text>
          <Text style={styles.heroTitle}>Một khoảng lặng{`\n`}dành cho bạn.</Text>
        </View>
        <View style={styles.streak}><Text style={styles.streakNumber}>7</Text><Text style={styles.streakLabel}>ngày</Text></View>
      </View>

      <Pressable onPress={() => router.push(`/reader/${currentProgress.chapterId}`)} style={({ pressed }) => [styles.continueCard, pressed && styles.pressed]}>
        <BookCover book={currentBook} width={92} elevated={false} />
        <View style={styles.continueContent}>
          <Text style={styles.continueCategory}>CHƯƠNG {currentChapter.number} · {currentChapter.duration.toUpperCase()}</Text>
          <Text numberOfLines={2} style={styles.continueTitle}>{currentBook.title}</Text>
          <Text numberOfLines={1} style={styles.chapter}>{currentChapter.title}</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${currentProgress.percent}%` }]} /></View>
          <View style={styles.progressMeta}><Text style={styles.progressText}>{currentProgress.percent}% chương hiện tại</Text><View style={styles.play}><AppIcon name="play" size={13} color={colors.white} /></View></View>
        </View>
      </Pressable>

      <View style={styles.section}>
        <SectionHeader title="Khám phá theo chủ đề" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.slice(1).map((category, index) => (
            <Pressable key={category} onPress={() => router.push({ pathname: '/(tabs)/search', params: { category } })} style={[styles.category, index === 0 && styles.categoryActive]}>
              <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Được yêu thích" action="Xem tất cả" onAction={() => router.push('/(tabs)/search')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>
          {books.slice(1).map((book) => <BookCard key={book.id} book={book} />)}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Mới trên Mộc Thư" action="Khám phá" onAction={() => router.push('/(tabs)/search')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>
          {[...books].reverse().slice(0, 4).map((book) => <BookCard key={book.id} book={book} />)}
        </ScrollView>
      </View>

      <View style={styles.quote}>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quoteText}>Sách là cách ta trò chuyện với những tâm hồn chưa từng gặp.</Text>
        <Text style={styles.quoteAuthor}>GỢI Ý HÔM NAY</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginBottom: 22 },
  eyebrow: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  greeting: { color: colors.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.6, marginTop: 5 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
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
