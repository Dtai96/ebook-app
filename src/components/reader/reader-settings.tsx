import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';

export type ReaderTheme = 'light' | 'sepia' | 'dark';

export function ReaderSettings({ visible, onClose, fontSize, setFontSize, lineHeight, setLineHeight, theme, setTheme }: {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  lineHeight: number;
  setLineHeight: (lineHeight: number) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(24, insets.bottom + 12) }]}>
        <View style={styles.handle} />
        <View style={styles.header}><Text style={styles.title}>Tùy chỉnh trang đọc</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng tùy chỉnh" onPress={onClose}><AppIcon name="close" size={28} /></Pressable></View>
        <Text style={styles.label}>Cỡ chữ</Text>
        <View style={styles.fontRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Giảm cỡ chữ" disabled={fontSize <= 15} onPress={() => setFontSize(Math.max(15, fontSize - 1))} style={styles.fontButton}><Text style={styles.fontSmall}>A</Text></Pressable>
          <View style={styles.sizeValue}><Text style={styles.sizeText}>{fontSize}px</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Tăng cỡ chữ" disabled={fontSize >= 24} onPress={() => setFontSize(Math.min(24, fontSize + 1))} style={styles.fontButton}><Text style={styles.fontLarge}>A</Text></Pressable>
        </View>
        <Text style={styles.label}>Khoảng cách dòng</Text>
        <View style={styles.lineHeightRow}>
          {([
            [1.5, 'Gọn'], [1.72, 'Vừa'], [1.95, 'Thoáng'],
          ] as const).map(([value, label]) => (
            <Pressable key={value} onPress={() => setLineHeight(value)} style={[styles.lineHeightButton, lineHeight === value && styles.lineHeightActive]}>
              <Text style={[styles.linePreview, { lineHeight: 8 * value }, lineHeight === value && styles.linePreviewActive]}>A{`\n`}A{`\n`}A</Text>
              <Text style={[styles.lineHeightText, lineHeight === value && styles.lineHeightTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Màu nền</Text>
        <View style={styles.themeRow}>
          {([
            ['light', 'Sáng', '#FFFDF8'], ['sepia', 'Sepia', '#EEE2C9'], ['dark', 'Tối', '#202521'],
          ] as const).map(([value, label, background]) => (
            <Pressable key={value} onPress={() => setTheme(value)} style={[styles.theme, { backgroundColor: background }, theme === value && styles.themeActive]}>
              {theme === value ? <AppIcon name="check" size={14} color={value === 'dark' ? colors.white : colors.moss} /> : null}
              <Text style={[styles.themeText, value === 'dark' && { color: colors.white }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(18,25,21,0.38)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10 },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  label: { color: colors.inkSoft, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 22, marginBottom: 10 },
  fontRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fontButton: { width: 58, height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  fontSmall: { color: colors.ink, fontFamily: 'serif', fontSize: 16 },
  fontLarge: { color: colors.ink, fontFamily: 'serif', fontSize: 24 },
  sizeValue: { flex: 1, height: 48, backgroundColor: colors.surfaceMuted, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  sizeText: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  lineHeightRow: { flexDirection: 'row', gap: 10 },
  lineHeightButton: { flex: 1, minHeight: 62, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  lineHeightActive: { backgroundColor: '#E2ECE4', borderColor: colors.moss },
  linePreview: { color: colors.inkSoft, fontFamily: 'serif', fontSize: 8, textAlign: 'center' },
  linePreviewActive: { color: colors.moss },
  lineHeightText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  lineHeightTextActive: { color: colors.moss },
  themeRow: { flexDirection: 'row', gap: 10 },
  theme: { flex: 1, height: 60, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  themeActive: { borderWidth: 2, borderColor: colors.moss },
  themeText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
});
