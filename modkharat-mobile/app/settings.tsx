import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Switch, Modal, FlatList } from 'react-native';
import { Globe, DollarSign, Tag, Bell, Lock, Download, Trash2, LogOut, ChevronRight, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { authApi } from '@/services/api';

const iconMap: Record<string, any> = {
  globe: Globe, dollar: DollarSign, tag: Tag, bell: Bell,
  lock: Lock, download: Download, trash: Trash2, logout: LogOut, calendar: Calendar,
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { language, toggleLanguage, firstDayOfMonth, setFirstDayOfMonth } = useApp();
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

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

  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const handleLanguageSelect = (lang: 'en' | 'ar') => {
    if (lang !== language) {
      i18n.changeLanguage(lang);
      toggleLanguage();
    }
    setShowLanguagePicker(false);
  };

  const [showFirstDayPicker, setShowFirstDayPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currency, setCurrency] = useState<'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'KWD' | 'BHD' | 'QAR' | 'OMR' | 'EGP' | 'JOD'>('SAR');

  const currencies = [
    { code: 'SAR' as const, flag: '🇸🇦', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'ر.س' },
    { code: 'AED' as const, flag: '🇦🇪', nameEn: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ' },
    { code: 'KWD' as const, flag: '🇰🇼', nameEn: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'د.ك' },
    { code: 'BHD' as const, flag: '🇧🇭', nameEn: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'د.ب' },
    { code: 'QAR' as const, flag: '🇶🇦', nameEn: 'Qatari Riyal', nameAr: 'ريال قطري', symbol: 'ر.ق' },
    { code: 'OMR' as const, flag: '🇴🇲', nameEn: 'Omani Rial', nameAr: 'ريال عُماني', symbol: 'ر.ع' },
    { code: 'EGP' as const, flag: '🇪🇬', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م' },
    { code: 'JOD' as const, flag: '🇯🇴', nameEn: 'Jordanian Dinar', nameAr: 'دينار أردني', symbol: 'د.أ' },
    { code: 'USD' as const, flag: '🇺🇸', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$' },
    { code: 'EUR' as const, flag: '🇪🇺', nameEn: 'Euro', nameAr: 'يورو', symbol: '€' },
    { code: 'GBP' as const, flag: '🇬🇧', nameEn: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£' },
  ];

  const handleAccounts = () => {
    router.push('/accounts');
  };

  const handleCategories = () => {
    Alert.alert(
      language === 'en' ? 'Categories' : 'الفئات',
      language === 'en' ? 'Category management coming soon.' : 'إدارة الفئات قريباً.',
    );
  };

  const handleExportData = () => {
    Alert.alert(
      language === 'en' ? 'Export Data' : 'تصدير البيانات',
      language === 'en' ? 'Your data will be exported as a CSV file.' : 'سيتم تصدير بياناتك كملف CSV.',
      [
        { text: language === 'en' ? 'Cancel' : 'إلغاء', style: 'cancel' },
        {
          text: language === 'en' ? 'Export' : 'تصدير',
          onPress: () => {
            Alert.alert(
              language === 'en' ? 'Coming Soon' : 'قريباً',
              language === 'en' ? 'Export feature is under development.' : 'ميزة التصدير قيد التطوير.',
            );
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      language === 'en' ? 'Delete Account' : 'حذف الحساب',
      language === 'en'
        ? 'This will permanently delete your account and all data. This action cannot be undone.'
        : 'سيتم حذف حسابك وجميع بياناتك نهائياً. لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: language === 'en' ? 'Cancel' : 'إلغاء', style: 'cancel' },
        {
          text: language === 'en' ? 'Delete' : 'حذف',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              language === 'en' ? 'Coming Soon' : 'قريباً',
              language === 'en' ? 'Account deletion is under development.' : 'حذف الحساب قيد التطوير.',
            );
          },
        },
      ],
    );
  };

  const settingsGroups: Array<{
    title: string;
    items: Array<{
      icon: string;
      label: string;
      value?: string;
      danger?: boolean;
      action: string;
      toggle?: boolean;
      toggleValue?: boolean;
    }>;
  }> = [
    {
      title: t('settings.preferences'),
      items: [
        { icon: 'globe', label: t('settings.language'), value: language === 'en' ? 'English' : 'العربية', action: 'language' },
        { icon: 'dollar', label: t('settings.currency'), value: language === 'en' ? currency : (currencies.find(c => c.code === currency)?.symbol ?? currency), action: 'currency' },
        { icon: 'calendar', label: t('settings.firstDayOfMonth'), value: String(firstDayOfMonth), action: 'firstDay' },
      ],
    },
    {
      title: t('settings.financialData'),
      items: [
        { icon: 'dollar', label: t('settings.accounts'), action: 'accounts' },
        { icon: 'tag', label: t('settings.categories'), action: 'categories' },
      ],
    },
    {
      title: t('settings.notifications'),
      items: [
        { icon: 'bell', label: t('settings.pushNotifications'), action: 'push', toggle: true, toggleValue: pushEnabled },
      ],
    },
    {
      title: t('settings.privacy'),
      items: [
        { icon: 'lock', label: t('settings.biometricLock'), action: 'biometric', toggle: true, toggleValue: biometricEnabled },
      ],
    },
    {
      title: t('settings.dataManagement'),
      items: [
        { icon: 'download', label: t('settings.exportData'), action: 'export' },
        { icon: 'trash', label: t('settings.deleteAccount'), danger: true, action: 'delete' },
      ],
    },
    {
      title: language === 'en' ? 'Account' : 'الحساب',
      items: [
        { icon: 'logout', label: language === 'en' ? 'Sign Out' : 'تسجيل الخروج', danger: true, action: 'signout' },
      ],
    },
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'language': setShowLanguagePicker(true); break;
      case 'currency': setShowCurrencyPicker(true); break;
      case 'firstDay': setShowFirstDayPicker(true); break;
      case 'accounts': handleAccounts(); break;
      case 'categories': handleCategories(); break;
      case 'push': setPushEnabled((v) => !v); break;
      case 'biometric': setBiometricEnabled((v) => !v); break;
      case 'export': handleExportData(); break;
      case 'delete': handleDeleteAccount(); break;
      case 'signout': handleSignOut(); break;
    }
  };

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
            {language === 'en' ? 'Modkharat' : 'مدخرات'}
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
                  onPress={() => handleAction(item.action)}
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
                    {item.toggle ? (
                      <Switch
                        value={item.toggleValue}
                        onValueChange={() => handleAction(item.action)}
                        trackColor={{ false: '#e2e8f0', true: '#6ee7b7' }}
                        thumbColor={item.toggleValue ? '#059669' : '#f4f4f5'}
                      />
                    ) : (
                      <>
                        {item.value && <Text className="text-slate-400 text-sm mr-2">{item.value}</Text>}
                        <ChevronRight size={16} color="#cbd5e1" />
                      </>
                    )}
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

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <Pressable
          onPress={() => setShowLanguagePicker(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: 20, width: '80%', paddingVertical: 8, maxWidth: 320 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', textAlign: 'center', paddingVertical: 16 }}>
              {language === 'en' ? 'Select Language' : 'اختر اللغة'}
            </Text>

            <Pressable
              onPress={() => handleLanguageSelect('en')}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 20, paddingVertical: 14,
                backgroundColor: language === 'en' ? '#ecfdf5' : '#ffffff',
                borderTopWidth: 1, borderTopColor: '#f1f5f9',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>🇺🇸</Text>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#1e293b' }}>English</Text>
              </View>
              {language === 'en' && (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={() => handleLanguageSelect('ar')}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 20, paddingVertical: 14,
                backgroundColor: language === 'ar' ? '#ecfdf5' : '#ffffff',
                borderTopWidth: 1, borderTopColor: '#f1f5f9',
                borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>🇸🇦</Text>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#1e293b' }}>العربية</Text>
              </View>
              {language === 'ar' && (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>
                </View>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* First Day of Month Picker Modal */}
      <Modal
        visible={showFirstDayPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFirstDayPicker(false)}
      >
        <Pressable
          onPress={() => setShowFirstDayPicker(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: 20, width: '80%', maxWidth: 320, maxHeight: '70%' }}
          >
            <View style={{ paddingVertical: 16, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
                {t('settings.selectFirstDay')}
              </Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
                {t('settings.firstDayHint')}
              </Text>
            </View>
            <FlatList
              data={Array.from({ length: 28 }, (_, i) => i + 1)}
              numColumns={7}
              keyExtractor={(item) => String(item)}
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={async () => {
                    setFirstDayOfMonth(item);
                    setShowFirstDayPicker(false);
                    try {
                      await authApi.updateProfile({ firstDayOfMonth: item });
                    } catch {}
                  }}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    margin: 4,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: firstDayOfMonth === item ? '#059669' : '#f8fafc',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: firstDayOfMonth === item ? '700' : '500',
                      color: firstDayOfMonth === item ? '#ffffff' : '#1e293b',
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <Pressable
          onPress={() => setShowCurrencyPicker(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: 20, width: '80%', maxWidth: 320, maxHeight: '70%' }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', textAlign: 'center', paddingVertical: 16 }}>
              {language === 'en' ? 'Select Currency' : 'اختر العملة'}
            </Text>

            <ScrollView bounces={false}>
              {currencies.map((c, idx) => (
                <Pressable
                  key={c.code}
                  onPress={() => {
                    setCurrency(c.code);
                    setShowCurrencyPicker(false);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 20, paddingVertical: 14,
                    backgroundColor: currency === c.code ? '#ecfdf5' : '#ffffff',
                    borderTopWidth: 1, borderTopColor: '#f1f5f9',
                    ...(idx === currencies.length - 1 ? { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 } : {}),
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 20, marginRight: 12 }}>{c.flag}</Text>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '500', color: '#1e293b' }}>
                        {language === 'en' ? c.nameEn : c.nameAr}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8' }}>{c.code} ({c.symbol})</Text>
                    </View>
                  </View>
                  {currency === c.code && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
