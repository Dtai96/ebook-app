import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { Screen } from '@/components/screen';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { books } from '@/data/books';
import { useAppStore } from '@/store/app-store';

export default function LibraryScreen() {
  const { favorites, progress } = useAppStore();
  const savedBooks = books.filter((book) => favorites.includes(book.id));
  const current = books.find((book) => progress[book.id]);

  return (
    <Screen>
      <Text style={styles.kicker}>KHÔNG GIAN CỦA BẠN</Text>
      <Text style={styles.title}>Thư viện</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNumber}>{savedBooks.length}</Text><Text style={styles.statLabel}>Đã lưu</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statNumber}>1</Text><Text style={styles.statLabel}>Đang đọc</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statNumber}>7</Text><Text style={styles.statLabel}>Ngày liên tiếp</Text></View>
      </View>

      {current ? (
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Đang đọc</Text>
          <Pressable onPress={() => router.push(`/reader/${progress[current.id].chapterId}`)} style={styles.currentCard}>
            <BookCover book={current} width={78} elevated={false} />
            <View style={styles.currentBody}>
              <Text style={styles.currentTitle}>{current.title}</Text>
              <Text style={styles.currentChapter}>Chương 2 · Thành phố của những ký ức</Text>
              <View style={styles.track}><View style={[styles.fill, { width: `${progress[current.id].percent}%` }]} /></View>
              <Text style={styles.percent}>{progress[current.id].percent}% hoàn thành</Text>
            </View>
            <View style={styles.roundButton}><AppIcon name="play" size={13} color={colors.white} /></View>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.block}>
        <View style={styles.headingRow}><Text style={styles.sectionTitle}>Sách yêu thích</Text><Text style={styles.subtle}>{savedBooks.length} cuốn</Text></View>
        <View style={styles.grid}>
          {savedBooks.map((book) => (
            <Pressable key={book.id} onPress={() => router.push(`/book/${book.id}`)} style={styles.gridItem}>
              <BookCover book={book} width={132} />
              <Text numberOfLines={2} style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 34, fontWeight: '700', marginTop: 6 },
  statsRow: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 18, marginTop: 22 },
  stat: { alignItems: 'center', flex: 1 },
  statNumber: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  block: { marginTop: 30 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', marginBottom: 15 },
  subtle: { color: colors.inkSoft, fontSize: 12, marginBottom: 15 },
  currentCard: { backgroundColor: '#E8E1D3', borderRadius: radii.lg, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 14 },
  currentBody: { flex: 1 },
  currentTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  currentChapter: { color: colors.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 5 },
  track: { height: 4, borderRadius: 2, backgroundColor: '#CEC6B5', marginTop: 13, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.moss },
  percent: { color: colors.inkSoft, fontSize: 10, marginTop: 7 },
  roundButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 24 },
  gridItem: { width: '46%' },
  bookTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', lineHeight: 20, marginTop: 10 },
  bookAuthor: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
});
