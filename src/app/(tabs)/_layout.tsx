import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/constants/theme";

// const tabGlyphs: Record<string, string> = {
//   home: "⌂",
//   search: "⌕",
//   library: "▤",
//   profile: "●",
// };

// function TabIcon({ name, focused }: { name: string; focused: boolean }) {
//   return (
//     <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
//       <Text style={[styles.icon, focused && styles.iconActive]}>
//         {tabGlyphs[name]}
//       </Text>
//     </View>
//   );
// }

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.mossDark,
        tabBarInactiveTintColor: "#899088",
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.bar,
        // tabBarIcon: ({ focused }) => (
        //   <TabIcon name={route.name} focused={focused} />
        // ),
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Khám phá",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Thư viện",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 78,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { fontSize: 11, fontWeight: "700" },
  iconWrap: {
    width: 35,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconWrapActive: { backgroundColor: "#DDE8DF" },
  icon: { color: "#899088", fontSize: 22, lineHeight: 24, fontWeight: "700" },
  iconActive: { color: colors.mossDark },
});
