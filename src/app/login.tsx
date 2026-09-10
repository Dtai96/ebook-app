import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.close}><AppIcon name="close" size={30} /></Pressable>
          <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>M</Text></View><Text style={styles.brandName}>Mộc Thư</Text></View>
          <Text style={styles.title}>Chào mừng trở lại.</Text>
          <Text style={styles.subtitle}>Tiếp tục hành trình đọc của riêng bạn.</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="ban@example.com" placeholderTextColor="#929790" keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.password}><TextInput style={styles.passwordInput} placeholder="Nhập mật khẩu" placeholderTextColor="#929790" secureTextEntry={!showPassword} /><Pressable onPress={() => setShowPassword(!showPassword)}><Text style={styles.show}>{showPassword ? 'Ẩn' : 'Hiện'}</Text></Pressable></View>
          <Pressable><Text style={styles.forgot}>Quên mật khẩu?</Text></Pressable>
          <Pressable onPress={() => router.replace('/(tabs)/home')} style={styles.primary}><Text style={styles.primaryText}>Đăng nhập</Text></Pressable>
          <View style={styles.or}><View style={styles.line} /><Text style={styles.orText}>hoặc</Text><View style={styles.line} /></View>
          <Pressable style={styles.social}><Text style={styles.socialMark}>G</Text><Text style={styles.socialText}>Tiếp tục với Google</Text></Pressable>
          <View style={styles.footer}><Text style={styles.footerText}>Chưa có tài khoản? </Text><Pressable onPress={() => router.push('/register')}><Text style={styles.footerLink}>Đăng ký</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 35 },
  close: { alignSelf: 'flex-end', width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.gold, fontFamily: 'serif', fontSize: 23, fontWeight: '800' },
  brandName: { color: colors.ink, fontFamily: 'serif', fontSize: 20, fontWeight: '700' },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 34, lineHeight: 41, fontWeight: '700', marginTop: 34 },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 9, marginBottom: 25 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 15 },
  input: { height: 54, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, color: colors.ink, fontSize: 14 },
  password: { height: 54, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, color: colors.ink, fontSize: 14 }, show: { color: colors.moss, fontSize: 12, fontWeight: '800' },
  forgot: { color: colors.moss, fontSize: 12, fontWeight: '700', alignSelf: 'flex-end', marginTop: 12 },
  primary: { height: 54, backgroundColor: colors.moss, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  primaryText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 }, line: { flex: 1, height: 1, backgroundColor: colors.border }, orText: { color: colors.inkSoft, fontSize: 11 },
  social: { height: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11, backgroundColor: colors.surface },
  socialMark: { color: '#4285F4', fontSize: 17, fontWeight: '900' }, socialText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 }, footerText: { color: colors.inkSoft, fontSize: 13 }, footerLink: { color: colors.coral, fontSize: 13, fontWeight: '800' },
});
