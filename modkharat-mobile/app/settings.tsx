import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Globe, DollarSign, Tag, Bell, Lock, Download, Trash2, LogOut, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { authApi } from '@/services/api';

const iconMap: Record<string, any> = {
  globe: Globe, dollar: DollarSign, tag: Tag, bell: Bell,
  lock: Lock, download: Download, trash: Trash2, logout: LogOut,
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language } = useApp();

  const handleSignOut = () => {
    Alert.alert(
      language === 'en' ? 'Sign Out' : 'تسجيل الخروج',
      language === 'en' ? 'Are you sure you want to sign out?' : 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: language === 'en' ? 'Cancel' : 'إلغاء', style: 'cancel' },
        {
          text: language === 'en' ? 'Sign Out' : 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            try {
              await authApi.signOut();
            } catch {}
          },
        },
      ],
    );
  };

  const settingsGroups: Array<{
    title: string;
    items: Array<{ icon: string; label: string; value?: string; danger?: boolean; action?: string }>;
  }> = [
    {
      title: t('settings.preferences'),
      items: [
        { icon: 'globe', label: t('settings.language'), value: language === 'en' ? 'English' : 'العربية' },
        { icon: 'dollar', label: t('settings.currency'), value: language === 'en' ? 'SAR' : 'ر.س' },
      ],
    },
    {
      title: t('settings.financialData'),
      items: [
        { icon: 'dollar', label: t('settings.accounts'), value: '3' },
        { icon: 'tag', label: t('settings.categories'), value: '9' },
      ],
    },
    {
      title: t('settings.notifications'),
      items: [
        { icon: 'bell', label: t('settings.pushNotifications'), value: language === 'en' ? 'On' : 'مفعّل' },
      ],
    },
    {
      title: t('settings.privacy'),
      items: [
        { icon: 'lock', label: t('settings.biometricLock'), value: language === 'en' ? 'Off' : 'معطّل' },
      ],
    },
    {
      title: t('settings.dataManagement'),
      items: [
        { icon: 'download', label: t('settings.exportData') },
        { icon: 'trash', label: t('settings.deleteAccount'), danger: true },
      ],
    },
    {
      title: t('settings.account') || (language === 'en' ? 'Account' : 'الحساب'),
      items: [
        { icon: 'logout', label: language === 'en' ? 'Sign Out' : 'تسجيل الخروج', danger: true, action: 'signout' },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={t('settings.title')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View className="items-center py-6">
          <View className="w-16 h-16 bg-emerald-600 rounded-2xl items-center justify-center mb-2">
            <Text className="text-white text-2xl font-bold">م</Text>
          </View>
          <Text className="text-slate-800 font-bold text-lg">
            {language === 'en' ? 'Modkharat' : 'مدخراتي'}
          </Text>
          <Text className="text-slate-400 text-xs">{t('settings.version')} 1.0.0</Text>
        </View>

        {settingsGroups.map((group) => (
          <View key={group.title} className="mx-4 mb-4 bg-white rounded-2xl overflow-hidden">
            <Text className="text-slate-500 text-xs font-semibold uppercase px-4 pt-4 pb-2">
              {group.title}
            </Text>
            {group.items.map((item, idx) => {
              const Icon = iconMap[item.icon] || Globe;
              return (
                <Pressable
                  key={item.label}
                  onPress={item.action === 'signout' ? handleSignOut : undefined}
                  className="flex-row items-center justify-between px-4 py-3.5 active:bg-slate-50"
                  style={idx < group.items.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : undefined}
                  accessibilityRole="button"
                  accessibilityLabel={item.value ? `${item.label}, ${item.value}` : item.label}
                >
                  <View className="flex-row items-center flex-1">
                    <Icon size={20} color={item.danger ? '#ef4444' : '#64748b'} />
                    <Text
                      className={`ml-3 text-sm font-medium ${item.danger ? 'text-red-500' : 'text-slate-700'}`}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {item.value && <Text className="text-slate-400 text-sm mr-2">{item.value}</Text>}
                    <ChevronRight size={16} color="#cbd5e1" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}

        {/* Footer */}
        <View className="items-center pb-8">
          <Text className="text-slate-300 text-xs">
            {t('settings.terms')} · {t('settings.privacyPolicy')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
