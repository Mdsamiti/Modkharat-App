import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { notificationsApi } from '@/services/api';

interface AppHeaderProps {
  title: string;
  showActions?: boolean;
}

export default function AppHeader({ title, showActions = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, toggleLanguage } = useApp();
  const { i18n } = useTranslation();

  const { data } = useApi(() => notificationsApi.listNotifications(), []);
  const unreadCount = data?.data?.filter((n) => !n.read).length ?? 0;

  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
    toggleLanguage();
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-white border-b border-slate-100 px-4 pb-3"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-slate-800">{title}</Text>

        {showActions && (
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleToggleLanguage}
              className="bg-slate-100 px-3 py-1.5 rounded-full"
              accessibilityLabel="Toggle language"
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text className="text-xs font-semibold text-slate-600">
                {language === 'en' ? 'عربي' : 'EN'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/notifications')}
              className="p-2 rounded-full"
              accessibilityLabel="Notifications"
              accessibilityRole="button"
              hitSlop={8}
            >
              <Bell size={22} color="#475569" />
              {unreadCount > 0 && (
                <View className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/settings')}
              className="p-2 rounded-full"
              accessibilityLabel="Settings"
              accessibilityRole="button"
              hitSlop={8}
            >
              <Settings size={22} color="#475569" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
