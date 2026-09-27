import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'mocthu.auth.token';
// Web tokens stay in memory; native sessions survive app restarts in SecureStore.
export const tokenStorage = {
  get: (): Promise<string | null> => Platform.OS === 'web' ? Promise.resolve(null) : SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string): Promise<void> => Platform.OS === 'web' ? Promise.resolve() : SecureStore.setItemAsync(TOKEN_KEY, token),
  remove: (): Promise<void> => Platform.OS === 'web' ? Promise.resolve() : SecureStore.deleteItemAsync(TOKEN_KEY),
};
