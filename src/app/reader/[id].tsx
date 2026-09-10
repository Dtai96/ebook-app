import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioPlayer } from '@/components/reader/audio-player';
import { ReaderSettings, ReaderTheme } from '@/components/reader/reader-settings';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii, shadows } from '@/constants/theme';
import { getChapter } from '@/data/books';
import { useAppStore } from '@/store/app-store';

const palettes = {
  light: { background: '#FFFDF8', text: '#252B27', muted: '#727971', surface: '#F5F1E8', border: '#E5E0D5' },
  sepia: { background: '#EEE2C9', text: '#3D3428', muted: '#756A5B', surface: '#E4D5B8', border: '#D7C6A6' },
  dark: { background: '#202521', text: '#E8E5DC', muted: '#A9AFA9', surface: '#2B312C', border: '#3B443D' },
};

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { book, chapter } = getChapter(id);
  const { bookmarks, toggleBookmark, saveProgress } = useAppStore();
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [readingPercent, setReadingPercent] = useState(12);
  const insets = useSafeAreaInsets();
  const palette = palettes[theme];
  const bookmarked = bookmarks.includes(chapter.id);
  const chapterIndex = book.chapters.findIndex((item) => item.id === chapter.id);
  const previous = book.chapters[chapterIndex - 1];
  const next = book.chapters[chapterIndex + 1];
  const content = useMemo(() => [...chapter.content, ...chapter.content], [chapter.content]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollable = Math.max(1, contentSize.height - layoutMeasurement.height);
    const percent = Math.min(100, Math.max(0, Math.round((contentOffset.y / scrollable) * 100)));
    setReadingPercent(percent);
    saveProgress(book.id, chapter.id, percent);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={[styles.nav, { borderBottomColor: palette.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}><AppIcon name="back" size={32} color={palette.text} /></Pressable>
        <View style={styles.navCenter}><Text style={[styles.navBook, { color: palette.text }]} numberOfLines={1}>{book.title}</Text><Text style={[styles.navChapter, { color: palette.muted }]}>Chương {chapter.number}/{book.chapters.length}</Text></View>
        <Pressable onPress={() => toggleBookmark(chapter.id)} style={styles.iconButton}><AppIcon name={bookmarked ? 'bookmarkFill' : 'bookmark'} size={23} color={bookmarked ? colors.coral : palette.text} /></Pressable>
      </View>
      <ScrollView onMomentumScrollEnd={handleScrollEnd} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 150 }]}>
        <Text style={[styles.chapterEyebrow, { color: colors.coral }]}>CHƯƠNG {String(chapter.number).padStart(2, '0')}</Text>
        <Text style={[styles.title, { color: palette.text }]}>{chapter.title}</Text>
        <View style={[styles.ornament, { backgroundColor: palette.border }]} />
        {content.map((paragraph, index) => <Text key={index} style={[styles.paragraph, { color: palette.text, fontSize, lineHeight: fontSize * 1.72 }]}>{paragraph}</Text>)}
        <View style={[styles.endMark, { borderColor: palette.border }]}><Text style={[styles.endText, { color: palette.muted }]}>Hết chương {chapter.number}</Text></View>
        <View style={styles.chapterNav}>
          <Pressable disabled={!previous} onPress={() => previous && router.replace(`/reader/${previous.id}`)} style={[styles.chapterButton, { backgroundColor: palette.surface }, !previous && styles.disabled]}><Text style={[styles.chapterButtonMeta, { color: palette.muted }]}>CHƯƠNG TRƯỚC</Text><Text numberOfLines={1} style={[styles.chapterButtonTitle, { color: palette.text }]}>{previous?.title ?? 'Không có'}</Text></Pressable>
          <Pressable disabled={!next} onPress={() => next && router.replace(`/reader/${next.id}`)} style={[styles.chapterButton, { backgroundColor: palette.surface }, !next && styles.disabled]}><Text style={[styles.chapterButtonMeta, { color: palette.muted }]}>CHƯƠNG SAU</Text><Text numberOfLines={1} style={[styles.chapterButtonTitle, { color: palette.text }]}>{next?.title ?? 'Đã hoàn thành'}</Text></Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bottomWrap, { bottom: Math.max(14, insets.bottom + 6) }]}>
        <View style={[styles.toolbar, shadows.card, { backgroundColor: theme === 'dark' ? '#343C36' : colors.ink }]}>
          <Pressable onPress={() => setSettingsOpen(true)} style={styles.tool}><AppIcon name="settings" color={colors.white} /><Text style={styles.toolLabel}>Hiển thị</Text></Pressable>
          <View style={styles.toolbarDivider} />
          <Pressable onPress={() => setPlayerOpen(true)} style={styles.voiceButton}><View style={styles.voiceIcon}><AppIcon name="spark" size={14} color={colors.white} /></View><View><Text style={styles.voiceTitle}>Nghe AI Voice</Text><Text style={styles.voiceSubtitle}>Giọng An · 1.0x</Text></View></Pressable>
          <View style={styles.progressCircle}><Text style={styles.progressNumber}>{readingPercent}%</Text></View>
        </View>
      </View>

      <ReaderSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)} fontSize={fontSize} setFontSize={setFontSize} theme={theme} setTheme={setTheme} />
      <AudioPlayer visible={playerOpen} onClose={() => setPlayerOpen(false)} book={book} chapter={chapter} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  nav: { height: 57, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  navBook: { maxWidth: 230, fontSize: 13, fontWeight: '800' },
  navChapter: { fontSize: 9, marginTop: 3 },
  content: { paddingHorizontal: 26, paddingTop: 34 },
  chapterEyebrow: { textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  title: { textAlign: 'center', fontFamily: 'serif', fontSize: 31, lineHeight: 39, fontWeight: '700', marginTop: 12 },
  ornament: { width: 42, height: 1, alignSelf: 'center', marginTop: 23, marginBottom: 25 },
  paragraph: { fontFamily: 'serif', marginBottom: 21, textAlign: 'left' },
  endMark: { borderTopWidth: 1, marginTop: 12, paddingTop: 20, alignItems: 'center' },
  endText: { fontSize: 11, fontStyle: 'italic' },
  chapterNav: { flexDirection: 'row', gap: 10, marginTop: 26 },
  chapterButton: { flex: 1, borderRadius: radii.md, padding: 14 },
  chapterButtonMeta: { fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  chapterButtonTitle: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  disabled: { opacity: 0.35 },
  bottomWrap: { position: 'absolute', left: 14, right: 14 },
  toolbar: { height: 66, borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  tool: { width: 64, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { color: '#C9D0CB', fontSize: 8, marginTop: 1 },
  toolbarDivider: { width: 1, height: 30, backgroundColor: '#465149' },
  voiceButton: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 11 },
  voiceIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  voiceTitle: { color: colors.white, fontSize: 12, fontWeight: '800' },
  voiceSubtitle: { color: '#ABB6AE', fontSize: 8, marginTop: 3 },
  progressCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  progressNumber: { color: colors.white, fontSize: 9, fontWeight: '800' },
});
