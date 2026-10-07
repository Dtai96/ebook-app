import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Tabs } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { colors } from "@/constants/theme";

const DESKTOP_BREAKPOINT = 768;

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Chiều rộng của Sidebar trên Desktop
  const sidebarWidth = isCollapsed ? 70 : 240;

  return (
    <View style={styles.rootContainer}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.mossDark,
          tabBarInactiveTintColor: "#899088",
          // Sửa thuộc tính sceneStyle đúng chuẩn TypeScript của Expo Router
          sceneStyle: isDesktop
            ? { marginLeft: sidebarWidth } // Đẩy nội dung chính sang phải bằng đúng độ rộng Sidebar
            : { paddingBottom: 0 },
        }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            isDesktop={isDesktop}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        )}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Khám phá",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="magnifyingglass" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Thư viện",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="book.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Cá nhân",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
  isDesktop,
  isCollapsed,
  onToggleCollapse,
}: any) {
  return (
    <View
      style={[
        styles.barBase,
        isDesktop
          ? [styles.barDesktop, isCollapsed && styles.barDesktopCollapsed]
          : styles.barMobile,
      ]}
    >
      {/* Nút Thu gọn / Mở rộng Sidebar */}
      {isDesktop && (
        <TouchableOpacity
          style={[styles.toggleBtn, isCollapsed && styles.toggleBtnCollapsed]}
          onPress={onToggleCollapse}
          activeOpacity={0.7}
        >
          <View style={{ transform: [{ rotate: isCollapsed ? "0deg" : "180deg" }] }}>
            <IconSymbol size={22} name="chevron.right" color={colors.mossDark} />
          </View>
          {!isCollapsed && <Text style={styles.toggleText}>Thu gọn</Text>}
        </TouchableOpacity>
      )}

      {/* Danh sách tab */}
      <View style={isDesktop ? styles.itemsContainerDesktop : styles.itemsContainerMobile}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title !== undefined ? options.title : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const activeColor = colors.mossDark;
          const inactiveColor = "#899088";
          const iconColor = isFocused ? activeColor : inactiveColor;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isDesktop
                  ? isCollapsed
                    ? styles.tabItemDesktopCollapsed
                    : styles.tabItemDesktop
                  : styles.tabItemMobile,
                isFocused && isDesktop && styles.tabItemActiveDesktop,
              ]}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  color: iconColor,
                  focused: isFocused,
                  size: 26,
                })}

              {(!isDesktop || !isCollapsed) && (
                <Text
                  style={[
                    styles.label,
                    isDesktop ? styles.labelDesktop : styles.labelMobile,
                    { color: iconColor },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  barBase: {
    backgroundColor: colors.surface,
  },

  /* MOBILE LAYOUT */
  barMobile: {
    flexDirection: "row",
    height: 78,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemsContainerMobile: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  /* DESKTOP LAYOUT (Ghim Sidebar cố định bên trái) */
  barDesktop: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 240,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: 20,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  barDesktopCollapsed: {
    width: 70,
    paddingHorizontal: 8,
  },
  itemsContainerDesktop: {
    flexDirection: "column",
    gap: 6,
  },

  /* TAB ITEM STYLES */
  tabItem: {
    borderRadius: 10,
  },
  tabItemMobile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemDesktop: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabItemDesktopCollapsed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  tabItemActiveDesktop: {
    backgroundColor: "#DDE8DF",
  },

  /* LABEL STYLES */
  label: {
    fontWeight: "700",
  },
  labelMobile: {
    fontSize: 11,
    marginTop: 4,
  },
  labelDesktop: {
    fontSize: 15,
    marginLeft: 12,
  },

  /* TOGGLE BUTTON STYLES */
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  toggleBtnCollapsed: {
    justifyContent: "center",
  },
  toggleText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: colors.mossDark,
  },
});