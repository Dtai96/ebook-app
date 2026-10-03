import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookCover } from '@/components/book/book-cover';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { bookApi } from '@/services/book-api';
import { useAppStore } from '@/store/app-store';
import type { Book } from '@/types/book';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!id) return;
    let active = true;
    bookApi.detail(id).then((result) => { if (active) { setBook(result); setError(''); } })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Không tải được sách.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reload]);
  const { favorites, toggleFavorite, progress } = useAppStore();
  const favorite = book ? favorites.includes(book.id) : false;
  const currentChapter = book ? progress[book.id]?.chapterId ?? book.chapters[0]?.id : undefined;

  if (loading && (!book || book.id !== id)) return <SafeAreaView style={styles.safe}><Text style={styles.description}>Đang tải sách...</Text></SafeAreaView>;
  if (error || !book || book.id !== id) return <SafeAreaView style={styles.safe}><Pressable onPress={() => { setLoading(true); setError(''); setReload((value) => value + 1); }}><Text style={styles.description}>{error || 'Không tìm thấy sách.'} · Chạm để thử lại</Text></Pressable></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}><AppIcon name="back" size={32} /></Pressable>
        <Text style={styles.navTitle}>Chi tiết sách</Text>
        <Pressable onPress={() => toggleFavorite(book.id)} style={styles.iconButton}><AppIcon name={favorite ? 'heartFill' : 'heart'} size={24} color={favorite ? colors.coral : colors.ink} /></Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.glow} />
          <BookCover book={book} width={146} />
          <Text style={styles.category}>{book.category.toUpperCase()}</Text>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>bởi {book.author}</Text>
          <View style={styles.metrics}>
            <View style={styles.metric}><Text style={styles.metricValue}>{book.viewCount}</Text><Text style={styles.metricLabel}>Lượt xem</Text></View>
            <View style={styles.divider} />
            <View style={styles.metric}><Text style={styles.metricValue}>{book.chaptersCount}</Text><Text style={styles.metricLabel}>Chương</Text></View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable disabled={!currentChapter} onPress={() => { if (currentChapter) router.push(`/reader/${currentChapter}`); }} style={({ pressed }) => [styles.primary, pressed && styles.pressed, !currentChapter && { opacity: 0.5 }]}><AppIcon name="play" size={15} color={colors.white} /><Text style={styles.primaryText}>{progress[book.id] ? 'Đọc tiếp' : 'Đọc ngay'}</Text></Pressable>
          <Pressable onPress={() => toggleFavorite(book.id)} style={styles.secondary}><AppIcon name={favorite ? 'heartFill' : 'heart'} size={20} color={favorite ? colors.coral : colors.moss} /><Text style={styles.secondaryText}>{favorite ? 'Đã lưu' : 'Yêu thích'}</Text></Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.description}>{book.description}</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Mục lục</Text><Text style={styles.duration}>{book.chaptersCount} chương</Text></View>
          <View style={styles.chapterList}>
            {book.chapters.map((chapter, index) => (
              <Pressable key={chapter.id} onPress={() => router.push(`/reader/${chapter.id}`)} style={[styles.chapterRow, index < book.chapters.length - 1 && styles.chapterBorder]}>
                <View style={styles.chapterNumber}><Text style={styles.chapterNumberText}>{String(chapter.number).padStart(2, '0')}</Text></View>
                <View style={styles.chapterBody}><Text style={styles.chapterTitle}>{chapter.title}</Text></View>
                {progress[book.id]?.chapterId === chapter.id ? <View style={styles.now}><Text style={styles.nowText}>ĐANG ĐỌC</Text></View> : <AppIcon name="chevron" color={colors.inkSoft} />}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  nav: { height: 54, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 60 },
  hero: { alignItems: 'center', overflow: 'hidden', paddingTop: 14, paddingHorizontal: 20 },
  glow: { position: 'absolute', top: 50, width: 250, height: 250, borderRadius: 125, opacity: 0.16, backgroundColor: colors.gold },
  category: { color: colors.coral, fontSize: 10, letterSpacing: 1.5, fontWeight: '800', marginTop: 22 },
  title: { color: colors.ink, fontFamily: 'serif', textAlign: 'center', fontSize: 29, lineHeight: 34, fontWeight: '700', marginTop: 8 },
  author: { color: colors.inkSoft, fontSize: 13, marginTop: 7 },
  metrics: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  metric: { width: 88, alignItems: 'center' },
  metricValue: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  metricLabel: { color: colors.inkSoft, fontSize: 10, marginTop: 4 },
  divider: { width: 1, height: 30, backgroundColor: colors.border },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 25 },
  primary: { flex: 1, height: 52, backgroundColor: colors.moss, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  secondary: { flex: 0.7, height: 52, borderWidth: 1, borderColor: colors.moss, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryText: { color: colors.moss, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.75 },
  section: { paddingHorizontal: 20, marginTop: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  duration: { color: colors.inkSoft, fontSize: 11 },
  description: { color: colors.inkSoft, fontSize: 14, lineHeight: 23, marginTop: 12 },
  chapterList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: 14, marginTop: 14 },
  chapterRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  chapterBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  chapterNumber: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#E7EDE7', alignItems: 'center', justifyContent: 'center' },
  chapterNumberText: { color: colors.moss, fontSize: 11, fontWeight: '800' },
  chapterBody: { flex: 1 },
  chapterTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  chapterMeta: { color: colors.inkSoft, fontSize: 10, marginTop: 5 },
  now: { backgroundColor: '#F1DFC8', borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 5 },
  nowText: { color: colors.coral, fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
});
