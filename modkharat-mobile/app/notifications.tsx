import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { AlertCircle, Target, TrendingUp, Info, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { notificationsApi } from '@/services/api';
import type { NotificationItem } from '@/types/models';

const iconMap: Record<string, any> = {
  'alert-circle': AlertCircle,
  target: Target,
  'trending-up': TrendingUp,
  info: Info,
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { language } = useApp();

  const { data, isLoading } = useApi(() => notificationsApi.listNotifications(), []);
  const notifications = data?.data ?? [];

  const today = notifications.filter((n) => n.time.includes('h ago'));
  const yesterday = notifications.filter((n) => n.time.includes('1d'));
  const older = notifications.filter(
    (n) => !n.time.includes('h ago') && !n.time.includes('1d')
  );

  const renderNotification = (item: NotificationItem) => {
    const Icon = iconMap[item.icon] || Info;
    return (
      <Pressable
        key={item.id}
        onPress={() => {
          if (!item.read) {
            notificationsApi.markRead(item.id);
          }
        }}
        className={`flex-row px-4 py-3.5 ${!item.read ? 'bg-blue-50/30' : ''} active:bg-slate-50`}
        style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}: ${item.message}`}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: item.bgColor }}
        >
          <Icon size={18} color={item.iconColor} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-800 font-medium text-sm">{item.title}</Text>
            {!item.read && <View className="w-2 h-2 bg-blue-500 rounded-full" />}
          </View>
          <Text className="text-slate-500 text-xs mt-0.5 leading-4" numberOfLines={2}>
            {item.message}
          </Text>
          <Text className="text-slate-400 text-[10px] mt-1">{item.time}</Text>
        </View>
        <ChevronRight size={16} color="#cbd5e1" className="self-center ml-2" />
      </Pressable>
    );
  };

  const renderGroup = (title: string, items: NotificationItem[]) => {
    if (items.length === 0) return null;
    return (
      <View className="mb-4">
        <Text className="text-slate-500 text-xs font-semibold uppercase px-4 py-2">{title}</Text>
        <View className="bg-white rounded-2xl mx-4 overflow-hidden">
          {items.map(renderNotification)}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <ScreenHeader title={t('notifications.title')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={t('notifications.title')} />
      <ScrollView className="flex-1 pt-2" showsVerticalScrollIndicator={false}>
        {renderGroup(t('notifications.today'), today)}
        {renderGroup(t('notifications.yesterday'), yesterday)}
        {renderGroup(t('notifications.older'), older)}
        {notifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-slate-400">{language === 'en' ? 'No notifications' : 'لا توجد إشعارات'}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
