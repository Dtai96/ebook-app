import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { colors, radii } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterScreen() {
  const { signUp, initializing } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading || initializing) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (name.trim().length < 2) return setError('Vui lòng nhập họ tên của bạn.');
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError('Email chưa đúng định dạng.');
    if (password.length < 8) return setError('Mật khẩu cần có ít nhất 8 ký tự.');
    if (password !== confirmation) return setError('Mật khẩu xác nhận chưa khớp.');
    if (!agreed) return setError('Bạn cần đồng ý với điều khoản để tiếp tục.');
    setError('');
    setLoading(true);
    try {
      await signUp(name, normalizedEmail, password, confirmation);
      router.replace('/(tabs)/home');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Pressable accessibilityLabel="Đóng" onPress={() => router.back()} style={styles.close}><AppIcon name="close" size={30} /></Pressable>
          <Text style={styles.kicker}>BẮT ĐẦU HÀNH TRÌNH</Text>
          <Text style={styles.title}>Tạo góc đọc của bạn.</Text>
          <Text style={styles.subtitle}>Tạo tài khoản Mộc Thư để bắt đầu hành trình đọc của bạn.</Text>
          <Text style={styles.label}>Tên hiển thị</Text><TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Tên của bạn" placeholderTextColor="#929790" autoComplete="name" />
          <Text style={styles.label}>Email</Text><TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="ban@example.com" placeholderTextColor="#929790" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Text style={styles.label}>Mật khẩu</Text><TextInput value={password} onChangeText={setPassword} style={styles.input} placeholder="Ít nhất 8 ký tự" placeholderTextColor="#929790" secureTextEntry autoComplete="new-password" />
          <Text style={styles.label}>Xác nhận mật khẩu</Text><TextInput value={confirmation} onChangeText={setConfirmation} style={styles.input} placeholder="Nhập lại mật khẩu" placeholderTextColor="#929790" secureTextEntry autoComplete="new-password" />
          <View style={styles.passwordHint}><View style={[styles.ruleDot, password.length >= 8 && styles.ruleDotDone]} /><Text style={styles.passwordHintText}>Tối thiểu 8 ký tự</Text></View>
          <Pressable accessibilityRole="checkbox" accessibilityLabel="Đồng ý điều khoản" accessibilityState={{ checked: agreed }} onPress={() => setAgreed(!agreed)} style={styles.agreement}><View style={[styles.checkbox, !agreed && styles.checkboxOff]}>{agreed ? <AppIcon name="check" size={13} color={colors.white} /> : null}</View><Text style={styles.agreementText}>Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.</Text></Pressable>
          {error ? <View style={styles.errorBox}><Text style={styles.error}>{error}</Text></View> : null}
          <Pressable disabled={loading || initializing} onPress={submit} style={[styles.primary, (loading || initializing) && styles.disabled]}><Text style={styles.primaryText}>{initializing ? 'Đang khôi phục phiên...' : loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</Text></Pressable>
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
  passwordHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  ruleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  ruleDotDone: { backgroundColor: colors.moss },
  passwordHintText: { color: colors.inkSoft, fontSize: 10 },
  agreement: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 19 },
  checkbox: { width: 22, height: 22, borderRadius: 7, backgroundColor: colors.moss, alignItems: 'center', justifyContent: 'center' },
  checkboxOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  agreementText: { flex: 1, color: colors.inkSoft, fontSize: 11, lineHeight: 16 },
  errorBox: { backgroundColor: '#F6E7E4', borderRadius: 12, padding: 11, marginTop: 14 },
  error: { color: colors.danger, fontSize: 11, lineHeight: 16 },
  primary: { height: 54, backgroundColor: colors.moss, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginTop: 20 }, primaryText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 }, footerText: { color: colors.inkSoft, fontSize: 13 }, footerLink: { color: colors.coral, fontSize: 13, fontWeight: '800' },
});
