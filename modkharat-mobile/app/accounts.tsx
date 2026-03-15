import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { Plus, Pencil, Trash2, Wallet, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { categoriesApi } from '@/services/api';
import type { AccountDTO } from '@/services/api/categories';

export default function AccountsScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const { data, isLoading, refetch } = useApi(() => categoriesApi.listAccounts(), []);
  const accounts = data?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountDTO | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [balance, setBalance] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const openAddForm = () => {
    setEditingAccount(null);
    setNameEn('');
    setNameAr('');
    setBalance('');
    setShowForm(true);
  };

  const openEditForm = (account: AccountDTO) => {
    setEditingAccount(account);
    setNameEn(account.nameEn);
    setNameAr(account.nameAr);
    setBalance(String(account.balance));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!nameEn.trim() || !nameAr.trim()) {
      Alert.alert(
        language === 'en' ? 'Error' : 'خطأ',
        language === 'en' ? 'Please fill in both English and Arabic names.' : 'يرجى ملء الاسم بالإنجليزية والعربية.',
      );
      return;
    }

    const balanceNum = balance ? Number(balance) : 0;
    if (isNaN(balanceNum) || balanceNum < 0) {
      Alert.alert(
        language === 'en' ? 'Error' : 'خطأ',
        language === 'en' ? 'Please enter a valid balance.' : 'يرجى إدخال رصيد صحيح.',
      );
      return;
    }

    setIsSaving(true);
    try {
      if (editingAccount) {
        await categoriesApi.updateAccount(editingAccount.id, nameEn.trim(), nameAr.trim(), balanceNum);
      } else {
        await categoriesApi.createAccount(nameEn.trim(), nameAr.trim(), balanceNum);
      }
      setShowForm(false);
      refetch();
    } catch (err: any) {
      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (account: AccountDTO) => {
    Alert.alert(
      language === 'en' ? 'Delete Account' : 'حذف الحساب',
      language === 'en'
        ? `Delete "${account.nameEn}"? Transactions linked to this account will keep their data.`
        : `حذف "${account.nameAr}"؟ المعاملات المرتبطة بهذا الحساب ستحتفظ ببياناتها.`,
      [
        { text: language === 'en' ? 'Cancel' : 'إلغاء', style: 'cancel' },
        {
          text: language === 'en' ? 'Delete' : 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoriesApi.deleteAccount(account.id);
              refetch();
            } catch (err: any) {
              Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <ScreenHeader title={t('settings.accounts')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={t('settings.accounts')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Accounts List */}
        {accounts.length > 0 ? (
          <View className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
            {accounts.map((account, idx) => (
              <Pressable
                key={account.id}
                onPress={() => openEditForm(account)}
                className="flex-row items-center justify-between px-4 py-4 active:bg-slate-50"
                style={idx < accounts.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : undefined}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-3">
                    <Wallet size={18} color="#059669" />
                  </View>
                  <View>
                    <Text className="text-slate-800 font-medium text-sm">
                      {language === 'en' ? account.nameEn : account.nameAr}
                    </Text>
                    <Text className="text-slate-400 text-xs">
                      {language === 'en' ? account.nameAr : account.nameEn}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-emerald-700 font-bold text-sm">
                    {currency} {account.balance.toLocaleString()}
                  </Text>
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); handleDelete(account); }}
                    className="p-2 rounded-full active:bg-red-50"
                    accessibilityRole="button"
                    accessibilityLabel={`${t('common.delete')} ${account.nameEn}`}
                    hitSlop={4}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-8 items-center">
            <Wallet size={40} color="#cbd5e1" />
            <Text className="text-slate-400 mt-3 text-center">
              {language === 'en' ? 'No accounts yet.\nAdd your first account.' : 'لا توجد حسابات بعد.\nأضف أول حساب.'}
            </Text>
          </View>
        )}

        {/* Add Account Button */}
        <View className="mx-4 mt-4 mb-6">
          <Pressable
            onPress={openAddForm}
            className="bg-emerald-600 rounded-2xl py-4 flex-row items-center justify-center active:bg-emerald-700"
            accessibilityRole="button"
            accessibilityLabel={language === 'en' ? 'Add Account' : 'إضافة حساب'}
          >
            <Plus size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">
              {language === 'en' ? 'Add Account' : 'إضافة حساب'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add / Edit Account Modal */}
      <Modal
        visible={showForm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForm(false)}
      >
        <Pressable
          onPress={() => setShowForm(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: 20, width: '85%', maxWidth: 360, padding: 20 }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>
                {editingAccount
                  ? (language === 'en' ? 'Edit Account' : 'تعديل الحساب')
                  : (language === 'en' ? 'New Account' : 'حساب جديد')}
              </Text>
              <Pressable onPress={() => setShowForm(false)} hitSlop={8}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            {/* English Name */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
              {language === 'en' ? 'Name (English)' : 'الاسم (بالإنجليزية)'}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 14,
              }}
              placeholder="e.g. Main Account"
              placeholderTextColor="#94a3b8"
              value={nameEn}
              onChangeText={setNameEn}
              autoCapitalize="words"
            />

            {/* Arabic Name */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
              {language === 'en' ? 'Name (Arabic)' : 'الاسم (بالعربية)'}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 14,
                textAlign: 'right',
              }}
              placeholder="مثال: الحساب الرئيسي"
              placeholderTextColor="#94a3b8"
              value={nameAr}
              onChangeText={setNameAr}
            />

            {/* Balance */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
              {language === 'en' ? 'Balance' : 'الرصيد'}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 20,
              }}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setShowForm(false)}
                style={{
                  flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
                }}
              >
                <Text style={{ color: '#475569', fontWeight: '600' }}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                style={{
                  flex: 1, backgroundColor: isSaving ? '#6ee7b7' : '#059669', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
                }}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>{t('common.save')}</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
