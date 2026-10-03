import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Modal, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioPlayer } from '@/components/reader/audio-player';
import { ReaderSettings } from '@/components/reader/reader-settings';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii, shadows } from '@/constants/theme';
import { bookApi } from '@/services/book-api';
import { useAppStore } from '@/store/app-store';
import type { Book, Chapter } from '@/types/book';

const palettes = {
  light: { background: '#FFFDF8', text: '#252B27', muted: '#727971', surface: '#F5F1E8', border: '#E5E0D5' },
  sepia: { background: '#EEE2C9', text: '#3D3428', muted: '#756A5B', surface: '#E4D5B8', border: '#D7C6A6' },
  dark: { background: '#202521', text: '#E8E5DC', muted: '#A9AFA9', surface: '#2B312C', border: '#3B443D' },
};

export default function ReaderScreen() {
  const { id, percent, paragraph } = useLocalSearchParams<{ id: string; percent?: string; paragraph?: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!id) return;
    let active = true;
    bookApi.chapter(id).then(async (loadedChapter) => {
      const loadedBook = await bookApi.detail(loadedChapter.bookId);
      if (!active) return;
      setChapter(loadedChapter);
      setBook({ ...loadedBook, chapters: loadedBook.chapters.map((item) => item.id === loadedChapter.id ? loadedChapter : item) });
      setError('');
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Không tải được chương.'); });
    return () => { active = false; };
  }, [id, reload]);
  if (error) return <SafeAreaView style={styles.safe}><Pressable onPress={() => setReload((value) => value + 1)}><Text>{error} · Chạm để thử lại</Text></Pressable></SafeAreaView>;
  if (!book || !chapter || chapter.id !== id) return <SafeAreaView style={styles.safe}><Text>Đang tải chương...</Text></SafeAreaView>;
  return <ReaderChapter key={[id, percent, paragraph].join(':')} book={book} chapter={chapter} percent={percent} paragraph={paragraph} />;
}

function ReaderChapter({ book, chapter, percent, paragraph }: { book: Book; chapter: Chapter; percent?: string; paragraph?: string }) {
  const { bookmarks, progress, readerPreferences, saveBookmark, saveProgress, updateReaderPreferences } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [note, setNote] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [initialProgress] = useState(() => {
    const requested = percent === undefined ? NaN : Number(percent);
    return Number.isFinite(requested) ? Math.min(100, Math.max(0, requested)) : progress[book.id]?.chapterId === chapter.id ? progress[book.id].percent : 0;
  });
  const scrollRef = useRef<ScrollView>(null);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const paragraphPositions = useRef<Record<number, number>>({});
  const restored = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [readingPercent, setReadingPercent] = useState(initialProgress);
  const insets = useSafeAreaInsets();
  const palette = palettes[readerPreferences.theme];
  const chapterBookmarks = bookmarks.filter((item) => item.chapterId === chapter.id);
  const chapterIndex = book.chapters.findIndex((item) => item.id === chapter.id);
  const previous = book.chapters[chapterIndex - 1];
  const next = book.chapters[chapterIndex + 1];
  const content = chapter.content;
  const quoteIndex = selectedParagraph ?? Math.min(content.length - 1, Math.floor((readingPercent / 100) * content.length));
  const selectedQuote = content[Math.max(0, quoteIndex)];

  const restorePosition = () => {
    if (restored.current || !viewportHeight.current || !contentHeight.current) return;
    const paragraphIndex = paragraph === undefined ? NaN : Number(paragraph);
    const targetParagraph = Number.isInteger(paragraphIndex) && paragraphIndex >= 0 && paragraphIndex < chapter.content.length;
    if (targetParagraph && paragraphPositions.current[paragraphIndex] === undefined) return;
    const scrollable = Math.max(0, contentHeight.current - viewportHeight.current);
    const y = targetParagraph ? Math.min(scrollable, paragraphPositions.current[paragraphIndex]) : scrollable * initialProgress / 100;
    restored.current = true;
    scrollRef.current?.scrollTo({ y, animated: false });
  };

  useEffect(() => {
    saveProgress(book.id, chapter.id, initialProgress);
  }, [book.id, chapter.id, initialProgress, saveProgress]);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!restored.current) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollable = Math.max(1, contentSize.height - layoutMeasurement.height);
    const percent = Math.min(100, Math.max(0, Math.round((contentOffset.y / scrollable) * 100)));
    setReadingPercent(percent);
    const nearest = Object.entries(paragraphPositions.current).filter(([, y]) => y <= contentOffset.y + 80).at(-1);
    setSelectedParagraph(nearest ? Number(nearest[0]) : 0);
    saveProgress(book.id, chapter.id, percent);
  };

  const saveCurrentBookmark = () => {
    saveBookmark({ bookId: book.id, chapterId: chapter.id, percent: readingPercent, paragraphIndex: quoteIndex, quote: selectedQuote, note: note.trim() });
    setBookmarkOpen(false);
    setSavedNotice(true);
    setNote('');
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: palette.background }]}>
      <StatusBar style={readerPreferences.theme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.nav, { borderBottomColor: palette.border }]}>
        <Pressable accessibilityLabel="Quay lại" onPress={() => router.back()} style={styles.iconButton}><AppIcon name="back" size={32} color={palette.text} /></Pressable>
        <View style={styles.navCenter}><Text style={[styles.navBook, { color: palette.text }]} numberOfLines={1}>{book.title}</Text><Text style={[styles.navChapter, { color: palette.muted }]}>Chương {chapter.number}/{book.chapters.length}</Text></View>
        <Pressable accessibilityLabel="Lưu vị trí đọc" onPress={() => setBookmarkOpen(true)} style={styles.iconButton}><AppIcon name={chapterBookmarks.length ? 'bookmarkFill' : 'bookmark'} size={23} color={chapterBookmarks.length ? colors.coral : palette.text} /></Pressable>
      </View>
      <ScrollView ref={scrollRef} testID="reader-scroll" onLayout={(event) => { viewportHeight.current = event.nativeEvent.layout.height; restorePosition(); }} onContentSizeChange={(_, height) => { contentHeight.current = height; restorePosition(); }} onScroll={handleScrollEnd} scrollEventThrottle={120} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 150 }]}>
        <Text style={[styles.chapterEyebrow, { color: colors.coral }]}>CHƯƠNG {String(chapter.number).padStart(2, '0')}</Text>
        <Text style={[styles.title, { color: palette.text }]}>{chapter.title}</Text>
        <View style={[styles.ornament, { backgroundColor: palette.border }]} />
        {content.map((paragraph, index) => <Text key={index} testID={`paragraph-${index}`} onLayout={(event) => { paragraphPositions.current[index] = event.nativeEvent.layout.y; restorePosition(); }} onLongPress={() => { setSelectedParagraph(index); setBookmarkOpen(true); }} selectable style={[styles.paragraph, { color: palette.text, fontSize: readerPreferences.fontSize, lineHeight: readerPreferences.fontSize * readerPreferences.lineHeight }]}>{paragraph}</Text>)}
        <View style={[styles.endMark, { borderColor: palette.border }]}><Text style={[styles.endText, { color: palette.muted }]}>Hết chương {chapter.number}</Text></View>
        <View style={styles.chapterNav}>
          <Pressable disabled={!previous} onPress={() => { if (previous) { setReadingPercent(0); setNote(''); router.replace(`/reader/${previous.id}`); } }} style={[styles.chapterButton, { backgroundColor: palette.surface }, !previous && styles.disabled]}><Text style={[styles.chapterButtonMeta, { color: palette.muted }]}>CHƯƠNG TRƯỚC</Text><Text numberOfLines={1} style={[styles.chapterButtonTitle, { color: palette.text }]}>{previous?.title ?? 'Không có'}</Text></Pressable>
          <Pressable disabled={!next} onPress={() => { if (next) { setReadingPercent(0); setNote(''); router.replace(`/reader/${next.id}`); } }} style={[styles.chapterButton, { backgroundColor: palette.surface }, !next && styles.disabled]}><Text style={[styles.chapterButtonMeta, { color: palette.muted }]}>CHƯƠNG SAU</Text><Text numberOfLines={1} style={[styles.chapterButtonTitle, { color: palette.text }]}>{next?.title ?? 'Đã hoàn thành'}</Text></Pressable>
        </View>
      </ScrollView>

      {savedNotice ? <View style={styles.toast}><AppIcon name="check" size={15} color={colors.white} /><Text style={styles.toastText}>Đã lưu bookmark và ghi chú</Text></View> : null}
      <View style={[styles.bottomWrap, { bottom: Math.max(14, insets.bottom + 6) }]}>
        <View style={[styles.toolbar, shadows.card, { backgroundColor: readerPreferences.theme === 'dark' ? '#343C36' : colors.ink }]}>
          <Pressable onPress={() => setSettingsOpen(true)} style={styles.tool}><AppIcon name="settings" color={colors.white} /><Text style={styles.toolLabel}>Hiển thị</Text></Pressable>
          <View style={styles.toolbarDivider} />
          <Pressable onPress={() => setPlayerOpen(true)} style={styles.voiceButton}><View style={styles.voiceIcon}><AppIcon name="spark" size={14} color={colors.white} /></View><View><Text style={styles.voiceTitle}>Nghe AI Voice</Text><Text style={styles.voiceSubtitle}>Giọng An · {readerPreferences.speed}x</Text></View></Pressable>
          <View style={styles.progressCircle}><Text style={styles.progressNumber}>{readingPercent}%</Text></View>
        </View>
      </View>

      <ReaderSettings
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={readerPreferences.fontSize}
        setFontSize={(fontSize) => updateReaderPreferences({ fontSize })}
        lineHeight={readerPreferences.lineHeight}
        setLineHeight={(lineHeight) => updateReaderPreferences({ lineHeight })}
        theme={readerPreferences.theme}
        setTheme={(theme) => updateReaderPreferences({ theme })}
      />
      <AudioPlayer
        key={chapter.id}
        visible={playerOpen}
        onClose={(chapterId) => { setPlayerOpen(false); if (chapterId !== chapter.id) router.replace(`/reader/${chapterId}`); }}
        book={book}
        chapter={chapter}
        speed={readerPreferences.speed}
        setSpeed={(speed) => updateReaderPreferences({ speed })}
      />

      <Modal visible={bookmarkOpen} transparent animationType="fade" onRequestClose={() => setBookmarkOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setBookmarkOpen(false)} />
        <KeyboardAvoidingView pointerEvents="box-none" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.bookmarkSheet} contentContainerStyle={{ padding: 22, paddingBottom: Math.max(24, insets.bottom + 12) }}>
          <View style={styles.sheetHeader}><View><Text style={styles.sheetKicker}>VỊ TRÍ {readingPercent}%</Text><Text style={styles.sheetTitle}>Lưu đoạn đang đọc</Text></View><Pressable onPress={() => setBookmarkOpen(false)} style={styles.iconButton}><AppIcon name="close" size={28} /></Pressable></View>
          <View style={styles.quoteCard}><Text style={styles.quoteMark}>“</Text><Text numberOfLines={4} style={styles.quoteText}>{selectedQuote}</Text></View>
          <View style={styles.chapterNav}>
            <Pressable accessibilityRole="button" disabled={quoteIndex === 0} onPress={() => setSelectedParagraph(Math.max(0, quoteIndex - 1))} style={[styles.chapterButton, quoteIndex === 0 && styles.disabled]}><Text style={styles.noteLabel}>Đoạn trước</Text></Pressable>
            <Text style={styles.noteLabel}>Đoạn {quoteIndex + 1}/{content.length}</Text>
            <Pressable accessibilityRole="button" disabled={quoteIndex === content.length - 1} onPress={() => setSelectedParagraph(Math.min(content.length - 1, quoteIndex + 1))} style={[styles.chapterButton, quoteIndex === content.length - 1 && styles.disabled]}><Text style={styles.noteLabel}>Đoạn sau</Text></Pressable>
          </View>
          <Text style={styles.noteLabel}>Ghi chú của bạn</Text>
          <TextInput accessibilityLabel="Ghi chú bookmark" value={note} onChangeText={setNote} multiline maxLength={240} placeholder="Ví dụ: Ý này muốn nhắc mình điều gì?" placeholderTextColor="#8A918A" style={styles.noteInput} />
          <View style={styles.noteMeta}><Text style={styles.noteHint}>Có thể lưu vị trí mà không cần ghi chú</Text><Text style={styles.noteCount}>{note.length}/240</Text></View>
          <Pressable onPress={saveCurrentBookmark} style={styles.saveButton}><AppIcon name="bookmarkFill" size={18} color={colors.white} /><Text style={styles.saveButtonText}>Lưu bookmark</Text></Pressable>
        </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  toast: { position: 'absolute', top: 68, alignSelf: 'center', zIndex: 4, backgroundColor: colors.moss, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  toastText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  modalOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(18,25,21,0.42)' },
  bookmarkSheet: { flexGrow: 0, maxHeight: '92%', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetKicker: { color: colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  sheetTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', marginTop: 5 },
  quoteCard: { backgroundColor: '#F0E9DB', borderRadius: radii.md, padding: 16, marginTop: 18, flexDirection: 'row', gap: 9 },
  quoteMark: { color: colors.coral, fontFamily: 'serif', fontSize: 30, lineHeight: 30 },
  quoteText: { flex: 1, color: colors.ink, fontFamily: 'serif', fontSize: 14, lineHeight: 21 },
  noteLabel: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 18, marginBottom: 8 },
  noteInput: { minHeight: 92, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.paper, borderRadius: radii.md, padding: 13, color: colors.ink, fontSize: 13, lineHeight: 19, textAlignVertical: 'top' },
  noteMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  noteHint: { color: colors.inkSoft, fontSize: 9 },
  noteCount: { color: colors.inkSoft, fontSize: 9 },
  saveButton: { height: 50, marginTop: 18, borderRadius: radii.md, backgroundColor: colors.moss, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
