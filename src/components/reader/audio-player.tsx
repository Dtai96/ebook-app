import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/book/book-cover';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { Book, Chapter } from '@/types/book';

const speeds = [0.75, 1, 1.25, 1.5, 2];
const timerOptions = [0, 15, 30];
function chapterDuration(chapter: Chapter) {
  return Math.max(1, Number.parseInt(chapter.duration, 10) || 1) * 60;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function AudioPlayer({ visible, onClose, book, chapter: initialChapter, speed, setSpeed }: {
  visible: boolean;
  onClose: (chapterId: string) => void;
  book: Book;
  chapter: Chapter;
  speed: number;
  setSpeed: (speed: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [playback, setPlayback] = useState({
    chapterIndex: Math.max(0, book.chapters.findIndex((item) => item.id === initialChapter.id)),
    position: 0, playing: false, timerMinutes: 0, timerSeconds: 0, stopAtChapterEnd: false, autoNext: true,
  });
  const { position, playing, timerMinutes, timerSeconds, stopAtChapterEnd, autoNext } = playback;
  const chapter = book.chapters[playback.chapterIndex];
  const duration = chapterDuration(chapter);
  const hasNextChapter = playback.chapterIndex < book.chapters.length - 1;
  const chunks = useMemo(() => chapter.content.flatMap((paragraph) => paragraph.match(/.{1,280}(?:\s|$)|.{1,280}/g) ?? []), [chapter.content]);
  const chunkNumber = Math.min(chunks.length, Math.floor(position / duration * chunks.length) + 1);

  useEffect(() => {
    if (!visible) return;
    let lastTick = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastTick) / 1000;
      lastTick = now;
      setPlayback((current) => {
        if (!current.playing) return current;
        const remaining = Math.max(0, current.timerSeconds - elapsed);
        // The sleep timer measures listening time, independently of playback speed.
        const audibleElapsed = current.timerSeconds > 0 ? Math.min(elapsed, current.timerSeconds) : elapsed;
        const chapterLength = chapterDuration(book.chapters[current.chapterIndex]);
        const nextPosition = Math.min(chapterLength, current.position + audibleElapsed * speed);
        const timerExpired = current.timerSeconds > 0 && remaining === 0;
        const atEnd = nextPosition >= chapterLength;
        if (atEnd && current.autoNext && !current.stopAtChapterEnd && !timerExpired && current.chapterIndex < book.chapters.length - 1) {
          return { ...current, chapterIndex: current.chapterIndex + 1, position: 0, timerSeconds: remaining };
        }
        return { ...current, position: nextPosition, timerSeconds: remaining,
          timerMinutes: timerExpired ? 0 : current.timerMinutes,
          playing: !timerExpired && !atEnd };
      });
    }, 250);
    return () => clearInterval(interval);
  }, [book.chapters, speed, visible]);

  const close = () => {
    setPlayback((current) => ({ ...current, playing: false }));
    onClose(chapter.id);
  };
  const seek = (seconds: number) => setPlayback((current) => ({ ...current, position: Math.min(duration, Math.max(0, current.position + seconds)) }));
  const togglePlaying = () => setPlayback((current) => ({ ...current, playing: !current.playing, position: current.position >= duration ? 0 : current.position }));
  const onNextChapter = () => setPlayback((current) => current.chapterIndex >= book.chapters.length - 1 ? current : { ...current, chapterIndex: current.chapterIndex + 1, position: 0 });
  const selectTimer = (minutes: number) => setPlayback((current) => ({ ...current, timerMinutes: minutes, timerSeconds: minutes * 60, stopAtChapterEnd: false }));
  const progress = `${Math.round(position / duration * 100)}%` as `${number}%`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={[styles.page, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.nav}><Pressable accessibilityLabel="Đóng trình phát" onPress={close} style={styles.close}><AppIcon name="close" size={30} /></Pressable><Text style={styles.navTitle}>AI Voice</Text><View style={styles.close} /></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.spark}><AppIcon name="spark" size={15} color={colors.coral} /><Text style={styles.sparkText}>GIỌNG ĐỌC AI · TIẾNG VIỆT</Text></View>
          <BookCover book={book} width={146} />
          <Text style={styles.chapter}>CHƯƠNG {chapter.number}</Text>
          <Text style={styles.title}>{chapter.title}</Text>
          <Text style={styles.book}>{book.title} · {book.author}</Text>
          <View style={styles.processing}><View style={styles.readyDot} /><Text style={styles.processingText}>Mô phỏng · Đoạn {chunkNumber}/{chunks.length} · Chưa có âm thanh</Text></View>

          <View style={styles.timeline}>
            <View style={styles.track}><View style={[styles.fill, { width: progress }]} /><View style={[styles.knob, { left: progress }]} /></View>
            <View style={styles.times}><Text style={styles.time}>{formatTime(position)}</Text><Text style={styles.time}>{formatTime(duration)}</Text></View>
          </View>
          <View style={styles.controls}>
            <Pressable accessibilityLabel="Tua lùi 10 giây" onPress={() => seek(-10)} style={styles.control}><AppIcon name="previous" size={30} /><Text style={styles.seekLabel}>10</Text></Pressable>
            <Pressable accessibilityLabel={playing ? 'Tạm dừng' : 'Phát'} onPress={togglePlaying} style={styles.play}><AppIcon name={playing ? 'pause' : 'play'} size={28} color={colors.white} /></Pressable>
            <Pressable accessibilityLabel="Tua tới 10 giây" onPress={() => seek(10)} style={styles.control}><AppIcon name="next" size={30} /><Text style={styles.seekLabel}>10</Text></Pressable>
          </View>

          <Text style={styles.sectionLabel}>TỐC ĐỘ ĐỌC</Text>
          <View style={styles.speeds}>
            {speeds.map((item) => <Pressable key={item} onPress={() => setSpeed(item)} style={[styles.speed, speed === item && styles.speedActive]}><Text style={[styles.speedText, speed === item && styles.speedTextActive]}>{item}x</Text></Pressable>)}
          </View>

          <View style={styles.sectionHeading}><Text style={styles.sectionLabel}>HẸN GIỜ DỪNG</Text>{timerSeconds > 0 ? <Text style={styles.timerRemaining}>Còn {formatTime(timerSeconds)}</Text> : null}</View>
          <View style={styles.timerRow}>
            {timerOptions.map((minutes) => <Pressable key={minutes} onPress={() => selectTimer(minutes)} style={[styles.timerChip, timerMinutes === minutes && !stopAtChapterEnd && styles.timerChipActive]}><Text style={[styles.timerText, timerMinutes === minutes && !stopAtChapterEnd && styles.timerTextActive]}>{minutes === 0 ? 'Tắt' : `${minutes} phút`}</Text></Pressable>)}
            <Pressable onPress={() => setPlayback((current) => ({ ...current, stopAtChapterEnd: true, timerMinutes: 0, timerSeconds: 0 }))} style={[styles.timerChip, stopAtChapterEnd && styles.timerChipActive]}><Text style={[styles.timerText, stopAtChapterEnd && styles.timerTextActive]}>Hết chương</Text></Pressable>
          </View>

          <Pressable disabled={!hasNextChapter} onPress={onNextChapter} style={[styles.nextChapter, !hasNextChapter && styles.disabled]}>
            <View style={styles.nextIcon}><AppIcon name="next" color={colors.moss} /></View>
            <View style={styles.nextBody}><Text style={styles.nextLabel}>PHÁT TIẾP</Text><Text style={styles.nextTitle}>{hasNextChapter ? 'Chuyển sang chương kế tiếp' : 'Đây là chương cuối'}</Text></View>
            <AppIcon name="chevron" color={colors.inkSoft} />
          </Pressable>
          <View style={styles.autoNextRow}><View><Text style={styles.autoNextTitle}>Tự động phát chương sau</Text><Text style={styles.autoNextText}>Tiếp tục nghe mà không đóng AI Voice</Text></View><Switch accessibilityLabel="Tự động phát chương sau" value={autoNext} onValueChange={(value) => setPlayback((current) => ({ ...current, autoNext: value }))} trackColor={{ false: colors.border, true: colors.sage }} thumbColor={autoNext ? colors.moss : colors.white} /></View>
          <View style={styles.voice}><View style={styles.voiceAvatar}><Text style={styles.voiceAvatarText}>AN</Text></View><View style={styles.voiceBody}><Text style={styles.voiceLabel}>Giọng đọc</Text><Text style={styles.voiceName}>An · Tự nhiên, ấm áp</Text></View><View style={styles.liveBadge}><Text style={styles.liveBadgeText}>ĐANG CHỌN</Text></View></View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: 20 },
  nav: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  navTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  content: { alignItems: 'center', paddingBottom: 30 },
  spark: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8, marginBottom: 18 },
  sparkText: { color: colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  chapter: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 20 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 23, fontWeight: '700', textAlign: 'center', marginTop: 7 },
  book: { textAlign: 'center', color: colors.inkSoft, fontSize: 12, marginTop: 6 },
  processing: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E4ECE5', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  readyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.moss },
  processingText: { flexShrink: 1, color: colors.moss, fontSize: 9, fontWeight: '700' },
  timeline: { width: '100%', marginTop: 23 },
  track: { height: 4, backgroundColor: '#D9D4C8', borderRadius: 2 },
  fill: { height: 4, backgroundColor: colors.coral, borderRadius: 2 },
  knob: { position: 'absolute', marginLeft: -7, top: -5, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.coral },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  time: { color: colors.inkSoft, fontSize: 10 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32, marginTop: 10 },
  play: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  control: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  seekLabel: { position: 'absolute', color: colors.ink, fontSize: 8, fontWeight: '800', top: 20 },
  sectionLabel: { alignSelf: 'flex-start', color: colors.inkSoft, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginTop: 23 },
  speeds: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  speed: { minWidth: 48, height: 34, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  speedActive: { backgroundColor: colors.moss, borderColor: colors.moss },
  speedText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  speedTextActive: { color: colors.white },
  sectionHeading: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  timerRemaining: { color: colors.coral, fontSize: 10, fontWeight: '800' },
  timerRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  timerChip: { flexGrow: 1, minWidth: 70, height: 35, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  timerChipActive: { backgroundColor: '#F0E1C8', borderColor: colors.gold },
  timerText: { color: colors.inkSoft, fontSize: 10, fontWeight: '700' },
  timerTextActive: { color: colors.ink },
  nextChapter: { width: '100%', minHeight: 64, marginTop: 18, paddingHorizontal: 12, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  nextIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E4ECE5', alignItems: 'center', justifyContent: 'center' },
  nextBody: { flex: 1, marginLeft: 10 },
  nextLabel: { color: colors.coral, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  nextTitle: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 3 },
  disabled: { opacity: 0.48 },
  autoNextRow: { width: '100%', minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 3, marginTop: 4 },
  autoNextTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  autoNextText: { color: colors.inkSoft, fontSize: 9, marginTop: 3 },
  voice: { width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, marginTop: 10, minHeight: 62, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  voiceAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E7EDE7', alignItems: 'center', justifyContent: 'center' },
  voiceAvatarText: { color: colors.moss, fontSize: 11, fontWeight: '900' },
  voiceBody: { flex: 1, marginLeft: 10 },
  voiceLabel: { color: colors.inkSoft, fontSize: 9 },
  voiceName: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 3 },
  liveBadge: { backgroundColor: '#E4ECE5', paddingHorizontal: 8, paddingVertical: 5, borderRadius: radii.pill },
  liveBadgeText: { color: colors.moss, fontSize: 7, fontWeight: '900' },
});
