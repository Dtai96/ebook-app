import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : "height"} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.close}><AppIcon name="close" size={30} /></Pressable>
          <Text style={styles.kicker}>BẮT ĐẦU HÀNH TRÌNH</Text>
          <Text style={styles.title}>Tạo góc đọc của bạn.</Text>
          <Text style={styles.subtitle}>Lưu sách, đánh dấu trang và nghe sách bằng AI Voice trên mọi thiết bị.</Text>
          <Text style={styles.label}>Tên hiển thị</Text><TextInput style={styles.input} placeholder="Tên của bạn" placeholderTextColor="#929790" />
          <Text style={styles.label}>Email</Text><TextInput style={styles.input} placeholder="ban@example.com" placeholderTextColor="#929790" keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Mật khẩu</Text><TextInput style={styles.input} placeholder="Ít nhất 8 ký tự" placeholderTextColor="#929790" secureTextEntry />
          <View style={styles.agreement}><View style={styles.checkbox}><AppIcon name="check" size={13} color={colors.white} /></View><Text style={styles.agreementText}>Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.</Text></View>
          <Pressable onPress={() => router.replace('/(tabs)/home')} style={styles.primary}><Text style={styles.primaryText}>Tạo tài khoản</Text></Pressable>
          <View style={styles.footer}><Text style={styles.footerText}>Đã có tài khoản? </Text><Pressable onPress={() => router.replace('/login')}><Text style={styles.footerLink}>Đăng nhập</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, flex: { flex: 1 }, content: { paddingHorizontal: 24, paddingBottom: 35 },
  close: { alignSelf: 'flex-end', width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: colors.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 28 },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 34, lineHeight: 41, fontWeight: '700', marginTop: 10 },
  subtitle: { color: colors.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 18 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 15 },
  input: { height: 54, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, color: colors.ink, fontSize: 14 },
  agreement: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 19 }, checkbox: { width: 22, height: 22, borderRadius: 7, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
  agreementText: { flex: 1, color: colors.inkSoft, fontSize: 11, lineHeight: 16 },
  primary: { height: 54, backgroundColor: colors.moss, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 24 }, primaryText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 }, footerText: { color: colors.inkSoft, fontSize: 13 }, footerLink: { color: colors.coral, fontSize: 13, fontWeight: '800' },
});
