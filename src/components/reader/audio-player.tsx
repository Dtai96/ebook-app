import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/book/book-cover';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { Book, Chapter } from '@/types/book';

const speeds = [0.75, 1, 1.25, 1.5, 2];
const timerOptions = [0, 15, 30];
const AUDIO_DURATION = 16 * 60 + 8;

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function AudioPlayer({ visible, onClose, book, chapter, speed, setSpeed, hasNextChapter, onNextChapter }: {
  visible: boolean;
  onClose: () => void;
  book: Book;
  chapter: Chapter;
  speed: number;
  setSpeed: (speed: number) => void;
  hasNextChapter: boolean;
  onNextChapter: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(272);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [stopAtChapterEnd, setStopAtChapterEnd] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [autoNext, setAutoNext] = useState(true);
  const chunks = useMemo(() => Math.max(1, Math.ceil(chapter.content.join(' ').length / 280)), [chapter.content]);

  useEffect(() => {
    if (!visible || !playing) return;
    const interval = setInterval(() => {
      setPosition((current) => {
        const next = Math.min(AUDIO_DURATION, current + speed);
        if (next >= AUDIO_DURATION) setPlaying(false);
        return next;
      });
      if (timerSeconds > 0) {
        setTimerSeconds((current) => {
          if (current <= 1) {
            setPlaying(false);
            return 0;
          }
          return current - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, speed, timerSeconds, visible]);

  useEffect(() => {
    if (visible && position >= AUDIO_DURATION && autoNext && hasNextChapter && !stopAtChapterEnd) onNextChapter();
  }, [autoNext, hasNextChapter, onNextChapter, position, stopAtChapterEnd, visible]);

  const seek = (seconds: number) => setPosition((current) => Math.min(AUDIO_DURATION, Math.max(0, current + seconds)));
  const selectTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    setStopAtChapterEnd(false);
    setTimerSeconds(minutes * 60);
  };
  const progress = `${Math.round((position / AUDIO_DURATION) * 100)}%` as `${number}%`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.page, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.nav}><Pressable accessibilityLabel="Đóng trình phát" onPress={onClose} style={styles.close}><AppIcon name="close" size={30} /></Pressable><Text style={styles.navTitle}>AI Voice</Text><View style={styles.close} /></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.spark}><AppIcon name="spark" size={15} color={colors.coral} /><Text style={styles.sparkText}>GIỌNG ĐỌC AI · TIẾNG VIỆT</Text></View>
          <BookCover book={book} width={146} />
          <Text style={styles.chapter}>CHƯƠNG {chapter.number}</Text>
          <Text style={styles.title}>{chapter.title}</Text>
          <Text style={styles.book}>{book.title} · {book.author}</Text>
          <View style={styles.processing}><View style={styles.readyDot} /><Text style={styles.processingText}>Đã tối ưu thành {chunks} đoạn âm thanh · Phát tuần tự</Text></View>

          <View style={styles.timeline}>
            <View style={styles.track}><View style={[styles.fill, { width: progress }]} /><View style={[styles.knob, { left: progress }]} /></View>
            <View style={styles.times}><Text style={styles.time}>{formatTime(position)}</Text><Text style={styles.time}>{formatTime(AUDIO_DURATION)}</Text></View>
          </View>
          <View style={styles.controls}>
            <Pressable accessibilityLabel="Tua lùi 10 giây" onPress={() => seek(-10)} style={styles.control}><AppIcon name="previous" size={30} /><Text style={styles.seekLabel}>10</Text></Pressable>
            <Pressable accessibilityLabel={playing ? 'Tạm dừng' : 'Phát'} onPress={() => setPlaying(!playing)} style={styles.play}><AppIcon name={playing ? 'pause' : 'play'} size={28} color={colors.white} /></Pressable>
            <Pressable accessibilityLabel="Tua tới 10 giây" onPress={() => seek(10)} style={styles.control}><AppIcon name="next" size={30} /><Text style={styles.seekLabel}>10</Text></Pressable>
          </View>

          <Text style={styles.sectionLabel}>TỐC ĐỘ ĐỌC</Text>
          <View style={styles.speeds}>
            {speeds.map((item) => <Pressable key={item} onPress={() => setSpeed(item)} style={[styles.speed, speed === item && styles.speedActive]}><Text style={[styles.speedText, speed === item && styles.speedTextActive]}>{item}x</Text></Pressable>)}
          </View>

          <View style={styles.sectionHeading}><Text style={styles.sectionLabel}>HẸN GIỜ DỪNG</Text>{timerSeconds > 0 ? <Text style={styles.timerRemaining}>Còn {formatTime(timerSeconds)}</Text> : null}</View>
          <View style={styles.timerRow}>
            {timerOptions.map((minutes) => <Pressable key={minutes} onPress={() => selectTimer(minutes)} style={[styles.timerChip, timerMinutes === minutes && !stopAtChapterEnd && styles.timerChipActive]}><Text style={[styles.timerText, timerMinutes === minutes && !stopAtChapterEnd && styles.timerTextActive]}>{minutes === 0 ? 'Tắt' : `${minutes} phút`}</Text></Pressable>)}
            <Pressable onPress={() => { setStopAtChapterEnd(true); setTimerMinutes(0); setTimerSeconds(0); }} style={[styles.timerChip, stopAtChapterEnd && styles.timerChipActive]}><Text style={[styles.timerText, stopAtChapterEnd && styles.timerTextActive]}>Hết chương</Text></Pressable>
          </View>

          <Pressable disabled={!hasNextChapter} onPress={onNextChapter} style={[styles.nextChapter, !hasNextChapter && styles.disabled]}>
            <View style={styles.nextIcon}><AppIcon name="next" color={colors.moss} /></View>
            <View style={styles.nextBody}><Text style={styles.nextLabel}>PHÁT TIẾP</Text><Text style={styles.nextTitle}>{hasNextChapter ? 'Chuyển sang chương kế tiếp' : 'Đây là chương cuối'}</Text></View>
            <AppIcon name="chevron" color={colors.inkSoft} />
          </Pressable>
          <View style={styles.autoNextRow}><View><Text style={styles.autoNextTitle}>Tự động phát chương sau</Text><Text style={styles.autoNextText}>Tiếp tục nghe mà không đóng AI Voice</Text></View><Switch value={autoNext} onValueChange={setAutoNext} trackColor={{ false: colors.border, true: colors.sage }} thumbColor={autoNext ? colors.moss : colors.white} /></View>
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
  book: { color: colors.inkSoft, fontSize: 12, marginTop: 6 },
  processing: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E4ECE5', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  readyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.moss },
  processingText: { color: colors.moss, fontSize: 9, fontWeight: '700' },
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
