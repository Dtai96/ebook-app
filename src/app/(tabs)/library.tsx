import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/book/book-cover';
import { Screen } from '@/components/screen';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { books, getChapter } from '@/data/books';
import { useAppStore } from '@/store/app-store';

type LibraryTab = 'favorites' | 'bookmarks';

export default function LibraryScreen() {
  const params = useLocalSearchParams<{ view?: LibraryTab }>();
  const { favorites, bookmarks, progress, removeBookmark } = useAppStore();
  const activeTab = params.view === 'bookmarks' ? 'bookmarks' : 'favorites';
  const setActiveTab = (view: LibraryTab) => router.setParams({ view });
  const savedBooks = books.filter((book) => favorites.includes(book.id));
  const recentBookId = Object.entries(progress).sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]?.[0];
  const current = books.find((book) => book.id === recentBookId);
  const currentChapter = current ? getChapter(progress[current.id].chapterId).chapter : null;

  return (
    <Screen>
      <Text style={styles.kicker}>KHÔNG GIAN CỦA BẠN</Text>
      <Text style={styles.title}>Thư viện</Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNumber}>{savedBooks.length}</Text><Text style={styles.statLabel}>Sách đã lưu</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statNumber}>{Object.keys(progress).length}</Text><Text style={styles.statLabel}>Đang đọc</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statNumber}>{bookmarks.length}</Text><Text style={styles.statLabel}>Bookmark</Text></View>
      </View>

      {current && currentChapter ? (
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Đang đọc</Text>
          <Pressable onPress={() => router.push(`/reader/${progress[current.id].chapterId}`)} style={styles.currentCard}>
            <BookCover book={current} width={78} elevated={false} />
            <View style={styles.currentBody}>
              <Text style={styles.currentTitle}>{current.title}</Text>
              <Text style={styles.currentChapter}>Chương {currentChapter.number} · {currentChapter.title}</Text>
              <View style={styles.track}><View style={[styles.fill, { width: `${progress[current.id].percent}%` }]} /></View>
              <Text style={styles.percent}>{progress[current.id].percent}% chương hiện tại</Text>
            </View>
            <View style={styles.roundButton}><AppIcon name="play" size={13} color={colors.white} /></View>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.tabs}>
        <Pressable onPress={() => setActiveTab('favorites')} style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}><Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>Sách yêu thích · {savedBooks.length}</Text></Pressable>
        <Pressable onPress={() => setActiveTab('bookmarks')} style={[styles.tab, activeTab === 'bookmarks' && styles.tabActive]}><Text style={[styles.tabText, activeTab === 'bookmarks' && styles.tabTextActive]}>Bookmark · {bookmarks.length}</Text></Pressable>
      </View>

      {activeTab === 'favorites' ? (
        <View style={styles.grid}>
          {savedBooks.map((book) => (
            <Pressable key={book.id} onPress={() => router.push(`/book/${book.id}`)} style={styles.gridItem}>
              <BookCover book={book} width={132} />
              <Text numberOfLines={2} style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>{book.author}</Text>
            </Pressable>
          ))}
          {!savedBooks.length ? <EmptyState title="Chưa có sách yêu thích" text="Chọn biểu tượng trái tim ở trang chi tiết để lưu sách tại đây." /> : null}
        </View>
      ) : (
        <View style={styles.bookmarkList}>
          {bookmarks.map((bookmark) => {
            const { book, chapter } = getChapter(bookmark.chapterId);
            return (
              <Pressable key={bookmark.id} onPress={() => router.push({ pathname: '/reader/[id]', params: { id: bookmark.chapterId, percent: String(bookmark.percent), ...(bookmark.paragraphIndex !== undefined ? { paragraph: String(bookmark.paragraphIndex) } : {}) } })} style={({ pressed }) => [styles.bookmarkCard, pressed && styles.pressed]}>
                <View style={styles.bookmarkTop}>
                  <View style={styles.bookmarkIcon}><AppIcon name="bookmarkFill" size={18} color={colors.coral} /></View>
                  <View style={styles.bookmarkHeading}><Text numberOfLines={1} style={styles.bookmarkBook}>{book.title}</Text><Text style={styles.bookmarkMeta}>Chương {chapter.number} · Vị trí {bookmark.percent}% · {bookmark.createdAt}</Text></View>
                  <Pressable accessibilityLabel="Xóa bookmark" onPress={(event) => { event.stopPropagation(); removeBookmark(bookmark.id); }} style={styles.remove}><AppIcon name="trash" size={20} color={colors.danger} /></Pressable>
                </View>
                <Text numberOfLines={3} style={styles.quote}>“{bookmark.quote}”</Text>
                {bookmark.note ? <View style={styles.note}><AppIcon name="note" size={16} color={colors.moss} /><Text style={styles.noteText}>{bookmark.note}</Text></View> : null}
              </Pressable>
            );
          })}
          {!bookmarks.length ? <EmptyState title="Chưa có bookmark" text="Trong trang đọc, chọn biểu tượng bookmark để lưu vị trí, đoạn văn và ghi chú." /> : null}
        </View>
      )}
    </Screen>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><AppIcon name="bookmark" size={28} color={colors.moss} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  kicker: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 34, fontWeight: '700', marginTop: 6 },
  statsRow: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 18, marginTop: 22 },
  stat: { alignItems: 'center', flex: 1 },
  statNumber: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.inkSoft, fontSize: 9, marginTop: 4 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  block: { marginTop: 28 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', marginBottom: 14 },
  currentCard: { backgroundColor: '#E8E1D3', borderRadius: radii.lg, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 14 },
  currentBody: { flex: 1 },
  currentTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  currentChapter: { color: colors.inkSoft, fontSize: 11, lineHeight: 16, marginTop: 5 },
  track: { height: 4, borderRadius: 2, backgroundColor: '#CEC6B5', marginTop: 13, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.moss },
  percent: { color: colors.inkSoft, fontSize: 10, marginTop: 7 },
  roundButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: 4, marginTop: 30, marginBottom: 18 },
  tab: { flex: 1, minHeight: 41, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: colors.moss, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 24 },
  gridItem: { width: '46%' },
  bookTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', lineHeight: 20, marginTop: 10 },
  bookAuthor: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  bookmarkList: { gap: 12 },
  bookmarkCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 15 },
  pressed: { opacity: 0.75 },
  bookmarkTop: { flexDirection: 'row', alignItems: 'center' },
  bookmarkIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F4E4DA', alignItems: 'center', justifyContent: 'center' },
  bookmarkHeading: { flex: 1, marginLeft: 10 },
  bookmarkBook: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  bookmarkMeta: { color: colors.inkSoft, fontSize: 9, marginTop: 4 },
  remove: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  quote: { color: colors.ink, fontFamily: 'serif', fontSize: 13, lineHeight: 20, marginTop: 13 },
  note: { backgroundColor: '#EAF0EA', borderRadius: 12, padding: 10, marginTop: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noteText: { flex: 1, color: colors.mossDark, fontSize: 11, lineHeight: 16 },
  empty: { width: '100%', alignItems: 'center', paddingVertical: 44, paddingHorizontal: 28 },
  emptyIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#E4ECE5', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 13 },
  emptyText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
});
