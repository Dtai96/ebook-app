import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { useAppStore } from '@/store/app-store';

export default function LoginScreen() {
  const { signIn } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError('Vui lòng nhập đúng địa chỉ email.');
    if (password.length < 6) return setError('Mật khẩu cần có ít nhất 6 ký tự.');
    setError('');
    setLoading(true);
    setTimeout(() => {
      signIn(normalizedEmail);
      setLoading(false);
      router.replace('/(tabs)/home');
    }, 450);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Pressable accessibilityLabel="Đóng" onPress={() => router.back()} style={styles.close}><AppIcon name="close" size={30} /></Pressable>
          <View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>M</Text></View><Text style={styles.brandName}>Mộc Thư</Text></View>
          <Text style={styles.title}>Chào mừng trở lại.</Text>
          <Text style={styles.subtitle}>Tiếp tục hành trình đọc của riêng bạn.</Text>
          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} style={[styles.input, error && !email.includes('@') ? styles.inputError : null]} placeholder="ban@example.com" placeholderTextColor="#929790" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={[styles.password, error && password.length < 6 ? styles.inputError : null]}><TextInput value={password} onChangeText={setPassword} style={styles.passwordInput} placeholder="Nhập mật khẩu" placeholderTextColor="#929790" secureTextEntry={!showPassword} autoComplete="password" /><Pressable onPress={() => setShowPassword(!showPassword)}><Text style={styles.show}>{showPassword ? 'Ẩn' : 'Hiện'}</Text></Pressable></View>
          {error ? <View style={styles.errorRow}><Text style={styles.errorIcon}>!</Text><Text style={styles.error}>{error}</Text></View> : null}
          <Pressable onPress={() => setError('Vui lòng liên hệ hỗ trợ để đặt lại mật khẩu.')}><Text style={styles.forgot}>Quên mật khẩu?</Text></Pressable>
          <Pressable disabled={loading} onPress={submit} style={[styles.primary, loading && styles.disabled]}><Text style={styles.primaryText}>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</Text></Pressable>
          <View style={styles.demo}><AppIcon name="info" size={16} color={colors.moss} /><Text style={styles.demoText}>Bản giao diện: dùng email hợp lệ và mật khẩu từ 6 ký tự.</Text></View>
          <View style={styles.footer}><Text style={styles.footerText}>Chưa có tài khoản? </Text><Pressable onPress={() => router.push('/register')}><Text style={styles.footerLink}>Đăng ký</Text></Pressable></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, flex: { flex: 1 }, content: { paddingHorizontal: 24, paddingBottom: 35 },
  close: { alignSelf: 'flex-end', width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.gold, fontFamily: 'serif', fontSize: 23, fontWeight: '800' },
  brandName: { color: colors.ink, fontFamily: 'serif', fontSize: 20, fontWeight: '700' },
  title: { color: colors.ink, fontFamily: 'serif', fontSize: 34, lineHeight: 41, fontWeight: '700', marginTop: 34 },
  subtitle: { color: colors.inkSoft, fontSize: 14, marginTop: 9, marginBottom: 25 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 15 },
  input: { height: 54, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, color: colors.ink, fontSize: 14 },
  inputError: { borderColor: colors.danger },
  password: { height: 54, backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, color: colors.ink, fontSize: 14 }, show: { color: colors.moss, fontSize: 12, fontWeight: '800' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  errorIcon: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#F3DEDB', color: colors.danger, textAlign: 'center', lineHeight: 18, fontSize: 11, fontWeight: '900' },
  error: { color: colors.danger, fontSize: 11 },
  forgot: { color: colors.coral, fontSize: 12, fontWeight: '700', textAlign: 'right', marginTop: 13 },
  primary: { height: 54, backgroundColor: colors.moss, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  disabled: { opacity: 0.6 }, primaryText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  demo: { backgroundColor: '#E7EDE7', borderRadius: radii.md, padding: 12, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  demoText: { flex: 1, color: colors.mossDark, fontSize: 10, lineHeight: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 26 }, footerText: { color: colors.inkSoft, fontSize: 13 }, footerLink: { color: colors.coral, fontSize: 13, fontWeight: '800' },
});
