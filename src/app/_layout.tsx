import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { AppStoreProvider } from '@/store/app-store';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

function AppNavigator() {
  const { isAdmin, initializing } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="reader/[id]" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="register" options={{ presentation: 'modal' }} />
      <Stack.Protected guard={!initializing && isAdmin}>
        <Stack.Screen name="bookadmin/index" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppStoreProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AppStoreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
