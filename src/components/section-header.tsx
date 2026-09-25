import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Pressable onPress={onAction}><Text style={styles.action}>{action}</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.4 },
  action: { color: colors.moss, fontSize: 13, fontWeight: '700' },
});
