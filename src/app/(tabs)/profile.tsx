import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ReaderSettings } from '@/components/reader/reader-settings';
import { Screen } from '@/components/screen';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

export default function ProfileScreen() {
  const { bookmarks, readerPreferences, updateReaderPreferences, signOut, user } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const rows = [
    { icon: 'Aa', title: 'Cài đặt đọc', subtitle: `${readerPreferences.fontSize}px · Dòng ${readerPreferences.lineHeight} · ${readerPreferences.speed}x`, onPress: () => setSettingsOpen(true) },
    { icon: '◐', title: 'Giao diện đọc', subtitle: readerPreferences.theme === 'light' ? 'Sáng' : readerPreferences.theme === 'sepia' ? 'Sepia' : 'Tối', onPress: () => setSettingsOpen(true) },
    { icon: '♧', title: 'Bookmark', subtitle: `${bookmarks.length} vị trí đã đánh dấu`, onPress: () => router.push({ pathname: '/(tabs)/library', params: { view: 'bookmarks' } }) },
    { icon: '?', title: 'Trợ giúp', subtitle: 'Câu hỏi thường gặp và góp ý', onPress: () => setHelpOpen(!helpOpen) },
  ];
  const displayUser = user ?? { name: 'Bạn đọc Mộc Thư', email: 'Chưa đăng nhập', initials: 'MT' };

  const logout = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <Screen>
      <Text style={styles.kicker}>TÀI KHOẢN</Text>
      <Text style={styles.title}>Cá nhân</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{displayUser.initials}</Text></View>
        <View style={styles.person}><Text style={styles.name}>{displayUser.name}</Text><Text style={styles.email}>{displayUser.email}</Text><View style={styles.member}><Text style={styles.memberText}>THÀNH VIÊN MỘC THƯ</Text></View></View>
      </View>
      <View style={styles.goalCard}>
        <View><Text style={styles.goalKicker}>MỤC TIÊU TUẦN</Text><Text style={styles.goalTitle}>Đọc 5 ngày</Text><Text style={styles.goalMeta}>Bạn đã hoàn thành 4/5 ngày</Text></View>
        <View style={styles.goalRing}><Text style={styles.goalNumber}>80%</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Tùy chỉnh</Text>
      <View style={styles.settings}>
        {rows.map((row) => (
          <Pressable key={row.title} onPress={row.onPress} style={styles.row}>
            <View style={styles.rowIcon}><Text style={styles.rowGlyph}>{row.icon}</Text></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>{row.title}</Text><Text style={styles.rowSubtitle}>{row.subtitle}</Text></View>
            <AppIcon name="chevron" color={colors.inkSoft} />
          </Pressable>
        ))}
        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.rowIcon}><AppIcon name="timer" size={19} color={colors.moss} /></View>
          <View style={styles.rowText}><Text style={styles.rowTitle}>Nhắc giờ đọc</Text><Text style={styles.rowSubtitle}>{notifications ? '20:30 mỗi ngày' : 'Đang tắt'}</Text></View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border, true: colors.sage }} thumbColor={notifications ? colors.moss : colors.white} />
        </View>
      </View>
      {helpOpen ? <Text style={styles.help}>Đọc sách từ Khám phá. Chạm giữ đoạn văn hoặc chọn biểu tượng bookmark để thêm ghi chú. AI Voice hiện là bản mô phỏng không có âm thanh. Dữ liệu được giữ trong phiên sử dụng.</Text> : null}
      <ReaderSettings visible={settingsOpen} onClose={() => setSettingsOpen(false)} fontSize={readerPreferences.fontSize} setFontSize={(fontSize) => updateReaderPreferences({ fontSize })} lineHeight={readerPreferences.lineHeight} setLineHeight={(lineHeight) => updateReaderPreferences({ lineHeight })} theme={readerPreferences.theme} setTheme={(theme) => updateReaderPreferences({ theme })} />
      <Pressable onPress={logout} style={styles.logout}><Text style={styles.logoutText}>{user ? 'Đăng xuất' : 'Đăng nhập'}</Text></Pressable>
      <Text style={styles.version}>Mộc Thư · Phiên bản giao diện 1.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  help: { color: colors.inkSoft, fontSize: 13, lineHeight: 21, marginTop: 16 },
  kicker: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 34, fontWeight: '700', marginTop: 6 },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginTop: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, borderRadius: radii.lg },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 17 },
  person: { flex: 1, marginLeft: 14 },
  name: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  email: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  member: { alignSelf: 'flex-start', backgroundColor: '#E4ECE5', borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8 },
  memberText: { color: colors.moss, fontSize: 7, fontWeight: '900', letterSpacing: 0.6 },
  goalCard: { backgroundColor: colors.mossDark, borderRadius: radii.lg, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  goalKicker: { color: '#B7CABD', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  goalTitle: { color: colors.white, fontSize: 21, fontWeight: '800', marginTop: 7 },
  goalMeta: { color: '#C8D4CC', fontSize: 11, marginTop: 5 },
  goalRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 6, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  goalNumber: { color: colors.white, fontSize: 13, fontWeight: '800' },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', marginTop: 30, marginBottom: 14 },
  settings: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15 },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E8EEE8', alignItems: 'center', justifyContent: 'center' },
  rowGlyph: { color: colors.moss, fontSize: 15, fontWeight: '800' },
  rowText: { flex: 1, marginLeft: 12 },
  rowTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  rowSubtitle: { color: colors.inkSoft, fontSize: 11, marginTop: 4 },
  logout: { borderWidth: 1, borderColor: '#D9B8B3', height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  version: { color: '#959A95', fontSize: 10, textAlign: 'center', marginTop: 18 },
});
