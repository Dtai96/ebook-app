import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { useState } from 'react';

const rows = [
  { icon: 'Aa', title: 'Cài đặt đọc', subtitle: 'Font, cỡ chữ và khoảng cách dòng' },
  { icon: '◐', title: 'Giao diện', subtitle: 'Theo cài đặt hệ thống' },
  { icon: '♧', title: 'Bookmark', subtitle: '1 vị trí đã đánh dấu' },
  { icon: '?', title: 'Trợ giúp', subtitle: 'Câu hỏi thường gặp và góp ý' },
];

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  return (
    <Screen>
      <Text style={styles.kicker}>TÀI KHOẢN</Text>
      <Text style={styles.title}>Cá nhân</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>DT</Text></View>
        <View style={styles.person}><Text style={styles.name}>Duy Trần</Text><Text style={styles.email}>duy.reader@example.com</Text></View>
        <Pressable onPress={() => router.push('/login')}><Text style={styles.edit}>Sửa</Text></Pressable>
      </View>
      <View style={styles.goalCard}>
        <View><Text style={styles.goalKicker}>MỤC TIÊU TUẦN</Text><Text style={styles.goalTitle}>Đọc 5 ngày</Text><Text style={styles.goalMeta}>Bạn đã hoàn thành 4/5 ngày</Text></View>
        <View style={styles.goalRing}><Text style={styles.goalNumber}>80%</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Tùy chỉnh</Text>
      <View style={styles.settings}>
        {rows.map((row, index) => (
          <Pressable key={row.title} style={[styles.row, index < rows.length - 1 && styles.rowBorder]}>
            <View style={styles.rowIcon}><Text style={styles.rowGlyph}>{row.icon}</Text></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>{row.title}</Text><Text style={styles.rowSubtitle}>{row.subtitle}</Text></View>
            <AppIcon name="chevron" color={colors.inkSoft} />
          </Pressable>
        ))}
        <View style={styles.row}>
          <View style={styles.rowIcon}><Text style={styles.rowGlyph}>•</Text></View>
          <View style={styles.rowText}><Text style={styles.rowTitle}>Nhắc giờ đọc</Text><Text style={styles.rowSubtitle}>20:30 mỗi ngày</Text></View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: colors.border, true: colors.sage }} thumbColor={notifications ? colors.moss : colors.white} />
        </View>
      </View>
      <Pressable onPress={() => router.push('/login')} style={styles.logout}><Text style={styles.logoutText}>Đăng xuất</Text></Pressable>
      <Text style={styles.version}>Mộc Thư · Phiên bản giao diện 1.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.coral, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 34, fontWeight: '700', marginTop: 6 },
  profileCard: { flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 17 },
  person: { flex: 1, marginLeft: 14 },
  name: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  email: { color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  edit: { color: colors.moss, fontSize: 13, fontWeight: '800' },
  goalCard: { backgroundColor: colors.mossDark, borderRadius: radii.lg, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 },
  goalKicker: { color: '#B7CABD', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  goalTitle: { color: colors.white, fontSize: 21, fontWeight: '800', marginTop: 7 },
  goalMeta: { color: '#C8D4CC', fontSize: 11, marginTop: 5 },
  goalRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 6, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  goalNumber: { color: colors.white, fontSize: 13, fontWeight: '800' },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', marginTop: 30, marginBottom: 14 },
  settings: { backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15 },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E8EEE8', alignItems: 'center', justifyContent: 'center' },
  rowGlyph: { color: colors.moss, fontSize: 15, fontWeight: '800' },
  rowText: { flex: 1, marginLeft: 12 },
  rowTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  rowSubtitle: { color: colors.inkSoft, fontSize: 11, marginTop: 4 },
  logout: { borderWidth: 1, borderColor: '#D9B8B3', height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '800' },
  version: { color: '#959A95', fontSize: 10, textAlign: 'center', marginTop: 18 },
});
