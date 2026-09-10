import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/book/book-cover';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { Book, Chapter } from '@/types/book';

const speeds = [0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer({ visible, onClose, book, chapter }: { visible: boolean; onClose: () => void; book: Book; chapter: Chapter }) {
  const insets = useSafeAreaInsets();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.page, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.nav}><Pressable onPress={onClose} style={styles.close}><AppIcon name="close" size={30} /></Pressable><Text style={styles.navTitle}>AI Voice</Text><View style={styles.close} /></View>
        <View style={styles.spark}><AppIcon name="spark" size={15} color={colors.coral} /><Text style={styles.sparkText}>GIỌNG ĐỌC AI · TIẾNG VIỆT</Text></View>
        <BookCover book={book} width={178} />
        <Text style={styles.chapter}>CHƯƠNG {chapter.number}</Text>
        <Text style={styles.title}>{chapter.title}</Text>
        <Text style={styles.book}>{book.title} · {book.author}</Text>
        <View style={styles.timeline}>
          <View style={styles.track}><View style={styles.fill} /><View style={styles.knob} /></View>
          <View style={styles.times}><Text style={styles.time}>04:32</Text><Text style={styles.time}>16:08</Text></View>
        </View>
        <View style={styles.controls}>
          <Pressable style={styles.control}><AppIcon name="previous" size={30} /><Text style={styles.seekLabel}>10</Text></Pressable>
          <Pressable onPress={() => setPlaying(!playing)} style={styles.play}><AppIcon name={playing ? 'pause' : 'play'} size={28} color={colors.white} /></Pressable>
          <Pressable style={styles.control}><AppIcon name="next" size={30} /><Text style={styles.seekLabel}>10</Text></Pressable>
        </View>
        <Text style={styles.speedLabel}>TỐC ĐỘ ĐỌC</Text>
        <View style={styles.speeds}>
          {speeds.map((item) => <Pressable key={item} onPress={() => setSpeed(item)} style={[styles.speed, speed === item && styles.speedActive]}><Text style={[styles.speedText, speed === item && styles.speedTextActive]}>{item}x</Text></Pressable>)}
        </View>
        <View style={styles.voice}><View style={styles.voiceAvatar}><Text style={styles.voiceAvatarText}>AN</Text></View><View style={styles.voiceBody}><Text style={styles.voiceLabel}>Giọng đọc</Text><Text style={styles.voiceName}>An · Tự nhiên, ấm áp</Text></View><AppIcon name="chevron" color={colors.inkSoft} /></View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', paddingHorizontal: 24 },
  nav: { width: '100%', height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  navTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  spark: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, marginBottom: 22 },
  sparkText: { color: colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  chapter: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginTop: 25 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  book: { color: colors.inkSoft, fontSize: 12, marginTop: 7 },
  timeline: { width: '100%', marginTop: 28 },
  track: { height: 4, backgroundColor: '#D9D4C8', borderRadius: 2 },
  fill: { width: '28%', height: 4, backgroundColor: colors.coral, borderRadius: 2 },
  knob: { position: 'absolute', left: '27%', top: -5, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.coral },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  time: { color: colors.inkSoft, fontSize: 10 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32, marginTop: 15 },
  play: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  control: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  seekLabel: { position: 'absolute', color: colors.ink, fontSize: 8, fontWeight: '800', top: 20 },
  speedLabel: { color: colors.inkSoft, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginTop: 27 },
  speeds: { flexDirection: 'row', gap: 7, marginTop: 11 },
  speed: { minWidth: 48, height: 34, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  speedActive: { backgroundColor: colors.moss, borderColor: colors.moss },
  speedText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  speedTextActive: { color: colors.white },
  voice: { width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, marginTop: 22, minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  voiceAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E7EDE7', alignItems: 'center', justifyContent: 'center' },
  voiceAvatarText: { color: colors.moss, fontSize: 11, fontWeight: '900' },
  voiceBody: { flex: 1, marginLeft: 10 },
  voiceLabel: { color: colors.inkSoft, fontSize: 9 },
  voiceName: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 3 },
});
