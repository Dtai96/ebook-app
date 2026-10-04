import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { GestureResponderEvent, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/book/book-cover';
import { chapterPosition, estimateWordIndex, seekTarget, segmentDuration, timelineFraction, wordWeights } from '@/components/reader/audio-timeline';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { AudioSegment, ttsApi } from '@/services/tts-api';
import { Book, Chapter } from '@/types/book';

const speeds = [0.75, 1, 1.25, 1.5, 2];
const timerOptions = [0, 15, 30];
function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
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
  const [chapterIndex, setChapterIndex] = useState(Math.max(0, book.chapters.findIndex((item) => item.id === initialChapter.id)));
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  const [stopAtChapterEnd, setStopAtChapterEnd] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('queued');
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const finishedSegment = useRef<string | null>(null);
  const currentIndexRef = useRef(0);
  const waitingRef = useRef(false);
  const segmentsRef = useRef<AudioSegment[]>([]);
  const generationRef = useRef('queued');
  const pendingPosition = useRef<number | null>(null);
  const timelineWidth = useRef(1);
  const timelineRef = useRef<View>(null);
  const playbackOptionsRef = useRef({ autoNext, stopAtChapterEnd, timerExpired, chapterIndex, hasNextChapter: false });
  const chapter = book.chapters[chapterIndex];
  const hasNextChapter = chapterIndex < book.chapters.length - 1;
  useEffect(() => {
    playbackOptionsRef.current = { autoNext, stopAtChapterEnd, timerExpired, chapterIndex, hasNextChapter };
  }, [autoNext, stopAtChapterEnd, timerExpired, chapterIndex, hasNextChapter]);
  const currentSegment = segments[segmentIndex];
  const audioUrl = currentSegment?.audio_url ?? null;
  const readyCount = segments.filter((segment) => segment.audio_url).length;
  const position = audioUrl && Number.isFinite(status.currentTime) ? Math.max(0, status.currentTime) : 0;
  const duration = audioUrl
    ? (Number.isFinite(status.duration) && status.duration > 0 ? status.duration : segmentDuration(currentSegment))
    : 0;
  const durations = segments.map(segmentDuration);
  const chapterDuration = durations.reduce((sum, item) => sum + item, 0);
  const playbackPosition = chapterPosition(durations, segmentIndex, position);
  const playing = Boolean(audioUrl && status.playing);
  const isVietnamese = /^vi(?:-|$)/i.test(book.language);
  const words = useMemo(() => currentSegment?.text.trim().split(/\s+/).filter(Boolean) ?? [], [currentSegment?.text]);
  const weights = wordWeights(words, isVietnamese);
  const estimatedWord = estimateWordIndex(weights, duration > 0 ? Math.min(1, position / duration) : 0);
  const hasWordTimings = currentSegment?.word_starts?.length === words.length;
  let activeWord = estimatedWord;
  if (hasWordTimings) {
    activeWord = 0;
    currentSegment.word_starts!.forEach((start, index) => { if (start <= position + 0.03) activeWord = index; });
  }
  const wordWindowStart = Math.max(0, activeWord - 12);
  const wordWindowEnd = Math.min(words.length, activeWord + 18);

  useEffect(() => {
    if (!visible) { player.pause(); return; }
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, [player, visible]);

  const selectSegment = useCallback((index: number) => {
    currentIndexRef.current = index;
    waitingRef.current = false;
    setWaitingForNext(false);
    setSegmentIndex(index);
  }, []);

  const selectChapter = useCallback((index: number) => {
    player.pause();
    setSegments([]);
    setSegmentIndex(0);
    setGenerationStatus('queued');
    setWaitingForNext(false);
    setError('');
    currentIndexRef.current = 0;
    waitingRef.current = false;
    segmentsRef.current = [];
    generationRef.current = 'queued';
    finishedSegment.current = null;
    pendingPosition.current = null;
    setChapterIndex(index);
  }, [player]);

  const finishChapter = useCallback(() => {
    const options = playbackOptionsRef.current;
    if (options.autoNext && !options.stopAtChapterEnd && !options.timerExpired && options.hasNextChapter) {
      selectChapter(options.chapterIndex + 1);
    }
  }, [selectChapter]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    let poll: ReturnType<typeof setTimeout>;
    const check = async (start: boolean) => {
      try {
        const result = start ? await ttsApi.createAudio(chapter.id, currentIndexRef.current) : await ttsApi.status(chapter.id);
        if (!active) return;
        segmentsRef.current = result.data.segments;
        generationRef.current = result.data.status;
        setSegments(result.data.segments);
        setGenerationStatus(result.data.status);
        setError('');
        if (waitingRef.current) {
          const nextIndex = currentIndexRef.current + 1;
          if (result.data.segments[nextIndex]?.audio_url) selectSegment(nextIndex);
          else if (result.data.status === 'ready' && nextIndex === result.data.segments.length) {
            waitingRef.current = false;
            setWaitingForNext(false);
            finishChapter();
          }
        }
        if (result.data.status !== 'ready') poll = setTimeout(() => check(false), 2000);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Không thể tạo âm thanh.');
      }
    };
    check(true);
    return () => { active = false; clearTimeout(poll); };
  }, [chapter.id, finishChapter, retry, selectSegment, visible]);

  useEffect(() => {
    if (!visible || segmentIndex === 0) return;
    ttsApi.createAudio(chapter.id, segmentIndex).catch((cause) => {
      setError(cause instanceof Error ? cause.message : 'Không thể yêu cầu đoạn đọc.');
    });
  }, [chapter.id, segmentIndex, visible]);

  useEffect(() => {
    if (!audioUrl || !visible) return;
    finishedSegment.current = null;
    const offset = pendingPosition.current;
    pendingPosition.current = null;
    if (offset !== null) {
      const listener = player.addListener('playbackStatusUpdate', (update) => {
        if (!update.isLoaded) return;
        listener.remove();
        player.seekTo(offset).then(() => player.play()).catch(() => setError('Không thể tua tới vị trí đã chọn.'));
      });
      player.replace(audioUrl);
      return () => listener.remove();
    } else {
      player.replace(audioUrl);
      player.play();
    }
  }, [audioUrl, player, visible]);

  useEffect(() => { if (audioUrl) player.setPlaybackRate(speed); }, [audioUrl, player, speed]);

  useEffect(() => {
    if (!visible || !playing || timerSeconds <= 0) return;
    const timer = setTimeout(() => {
      if (timerSeconds <= 1) {
        player.pause();
        setTimerMinutes(0);
        setTimerExpired(true);
        setTimerSeconds(0);
      } else {
        setTimerSeconds(timerSeconds - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [player, playing, timerSeconds, visible]);

  useEffect(() => {
    const listener = player.addListener('playbackStatusUpdate', (update) => {
      const index = currentIndexRef.current;
      const marker = `${chapter.id}:${index}`;
      if (!update.didJustFinish || finishedSegment.current === marker) return;
      finishedSegment.current = marker;
      if (segmentsRef.current[index + 1]?.audio_url) selectSegment(index + 1);
      else if (index === segmentsRef.current.length - 1) finishChapter();
      else { waitingRef.current = true; setWaitingForNext(true); }
    });
    return () => listener.remove();
  }, [chapter.id, finishChapter, player, selectSegment]);

  const close = () => {
    player.pause();
    onClose(chapter.id);
  };
  const seekToChapterPosition = (seconds: number) => {
    const target = seekTarget(durations, seconds);
    if (!target) return;
    const { index, offset } = target;
    if (index === segmentIndex && audioUrl) {
      player.seekTo(offset).catch(() => setError('Không thể tua tới vị trí đã chọn.'));
    } else {
      player.pause();
      pendingPosition.current = offset;
      selectSegment(index);
    }
  };
  const seek = (seconds: number) => seekToChapterPosition(playbackPosition + seconds);
  const seekFromTimeline = (event: GestureResponderEvent) => {
    const nativeEvent = event.nativeEvent as typeof event.nativeEvent & { clientX?: number };
    const fraction = timelineFraction(nativeEvent.locationX, timelineWidth.current);
    if (fraction !== null) {
      seekToChapterPosition(fraction * chapterDuration);
    } else if (Number.isFinite(nativeEvent.clientX)) {
      timelineRef.current?.measureInWindow((x, _y, width) => {
        const measuredFraction = timelineFraction(nativeEvent.clientX! - x, width);
        if (measuredFraction !== null) seekToChapterPosition(measuredFraction * chapterDuration);
      });
    }
  };
  const togglePlaying = () => {
    if (playing) player.pause();
    else { if (duration > 0 && position >= duration) player.seekTo(0).catch(() => {}); player.play(); }
  };
  const onNextChapter = () => { if (hasNextChapter) selectChapter(chapterIndex + 1); };
  const selectTimer = (minutes: number) => { setTimerMinutes(minutes); setTimerSeconds(minutes * 60); setTimerExpired(false); setStopAtChapterEnd(false); };
  const progress = `${chapterDuration > 0 ? Math.round(playbackPosition / chapterDuration * 100) : 0}%` as `${number}%`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={[styles.page, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.nav}><Pressable accessibilityLabel="Đóng trình phát" onPress={close} style={styles.close}><AppIcon name="close" size={30} /></Pressable><Text style={styles.navTitle}>AI Voice</Text><View style={styles.close} /></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.spark}><AppIcon name="spark" size={15} color={colors.coral} /><Text style={styles.sparkText}>{isVietnamese ? 'GIỌNG ĐỌC AI · HỮU ĐẠT' : 'GIỌNG ĐỌC AI · TIẾNG ANH'}</Text></View>
          <BookCover book={book} width={146} />
          <Text style={styles.chapter}>CHƯƠNG {chapter.number}</Text>
          <Text style={styles.title}>{chapter.title}</Text>
          <Text style={styles.book}>{book.title} · {book.author}</Text>
          <View style={styles.processing}><View style={styles.readyDot} /><Text style={styles.processingText}>{error || (generationStatus === 'ready' ? 'Đã tạo xong âm thanh' : `Đã có ${readyCount}/${segments.length || '?'} đoạn · chuẩn bị 8 đoạn tiếp theo`)}</Text></View>
          {segments.length > 1 ? <View style={styles.generationTrack}><View style={[styles.generationFill, { width: `${Math.round(readyCount / segments.length * 100)}%` }]} /></View> : null}
          {error ? <Pressable onPress={() => setRetry((value) => value + 1)}><Text style={styles.processingText}>Thử lại</Text></Pressable> : null}
          {currentSegment ? <View style={styles.transcript}>
            <Text style={styles.transcriptLabel}>ĐOẠN {segmentIndex + 1}/{segments.length} · {hasWordTimings && currentSegment.timing_quality === 'phoneme' ? 'THEO GIỌNG ĐỌC' : 'TÔ SÁNG ƯỚC LƯỢNG'}</Text>
            <Text style={styles.transcriptText}>{wordWindowStart > 0 ? '… ' : ''}{words.slice(wordWindowStart, wordWindowEnd).map((word, offset) => <Text key={`${segmentIndex}-${wordWindowStart + offset}`} style={wordWindowStart + offset === activeWord && audioUrl ? styles.spokenWord : undefined}>{word}{wordWindowStart + offset < words.length - 1 ? ' ' : ''}</Text>)}{wordWindowEnd < words.length ? '…' : ''}</Text>
          </View> : null}
          {!audioUrl && segments.length > 0 ? <Text style={styles.waiting}>Đang tạo đoạn {segmentIndex + 1}...</Text> : waitingForNext ? <Text style={styles.waiting}>Đang chờ đoạn tiếp theo...</Text> : null}

          <View style={styles.timeline}>
            <Pressable
              accessibilityRole="adjustable"
              accessibilityLabel="Vị trí trong chương"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(chapterDuration ? playbackPosition / chapterDuration * 100 : 0) }}
              accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
              onAccessibilityAction={(event) => seek(event.nativeEvent.actionName === 'increment' ? 30 : -30)}
              onLayout={(event) => { timelineWidth.current = event.nativeEvent.layout.width; }}
              onPress={seekFromTimeline}
              ref={timelineRef}
              style={styles.seekTrack}
            >
              <View style={styles.track}><View style={[styles.fill, { width: progress }]} /><View style={[styles.knob, { left: progress }]} /></View>
            </Pressable>
            <View style={styles.times}><Text style={styles.time}>{formatTime(playbackPosition)}</Text><Text style={styles.time}>~{formatTime(chapterDuration)}</Text></View>
          </View>
          <View style={styles.controls}>
            <Pressable accessibilityLabel="Tua lùi 10 giây" disabled={!audioUrl} onPress={() => seek(-10)} style={[styles.control, !audioUrl && styles.disabled]}><AppIcon name="previous" size={50} /><Text style={styles.seekLabel}>-10</Text></Pressable>
            <Pressable accessibilityLabel={playing ? 'Tạm dừng' : 'Phát'} disabled={!audioUrl} onPress={togglePlaying} style={[styles.play, !audioUrl && styles.disabled]}><AppIcon name={playing ? 'pause' : 'play'} size={28} color={colors.white} /></Pressable>
            <Pressable accessibilityLabel="Tua tới 10 giây" disabled={!audioUrl} onPress={() => seek(10)} style={[styles.control, !audioUrl && styles.disabled]}><AppIcon name="next" size={50} /><Text style={styles.seekLabel}>10</Text></Pressable>
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
          <View style={styles.autoNextRow}><View><Text style={styles.autoNextTitle}>Tự động phát chương sau</Text><Text style={styles.autoNextText}>Tiếp tục nghe mà không đóng AI Voice</Text></View><Switch accessibilityLabel="Tự động phát chương sau" value={autoNext} onValueChange={setAutoNext} trackColor={{ false: colors.border, true: colors.sage }} thumbColor={autoNext ? colors.moss : colors.white} /></View>
          <View style={styles.voice}><View style={styles.voiceAvatar}><Text style={styles.voiceAvatarText}>EN</Text></View><View style={styles.voiceBody}><Text style={styles.voiceLabel}>Giọng đọc</Text><Text style={styles.voiceName}>Kokoro · af_heart</Text></View><View style={styles.liveBadge}><Text style={styles.liveBadgeText}>ĐANG CHỌN</Text></View></View>
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
  generationTrack: { width: '100%', height: 4, borderRadius: 2, backgroundColor: '#D9E3D9', marginTop: 8 },
  generationFill: { height: 4, borderRadius: 2, backgroundColor: colors.moss },
  transcript: { width: '100%', marginTop: 16, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16 },
  transcriptLabel: { color: colors.inkSoft, fontSize: 9, fontWeight: '800', marginBottom: 8 },
  transcriptText: { color: colors.ink, fontFamily: 'serif', fontSize: 17, lineHeight: 27 },
  spokenWord: { color: colors.coral, backgroundColor: '#F7DEC8', fontWeight: '700' },
  waiting: { color: colors.inkSoft, fontSize: 11, marginTop: 8 },
  timeline: { width: '100%', marginTop: 23 },
  seekTrack: { width: '100%', height: 28, justifyContent: 'center' },
  track: { height: 4, backgroundColor: '#D9D4C8', borderRadius: 2 },
  fill: { height: 4, backgroundColor: colors.coral, borderRadius: 2 },
  knob: { position: 'absolute', marginLeft: -7, top: -5, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.coral },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  time: { color: colors.inkSoft, fontSize: 10 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32, marginTop: 10 },
  play: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  control: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  seekLabel: { position: 'absolute', color: colors.ink, fontSize: 8, fontWeight: '800', top: 35 },
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
