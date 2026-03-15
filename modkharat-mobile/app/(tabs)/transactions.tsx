import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { Search, Filter, Edit3, MessageSquare, Mic, Camera, Paperclip, TrendingUp, TrendingDown, X, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { transactionsApi, categoriesApi } from '@/services/api';
import type { Transaction } from '@/types/models';

const methodIcons: Record<string, React.ReactNode> = {
  manual: <Edit3 size={12} color="#94a3b8" />,
  sms: <MessageSquare size={12} color="#94a3b8" />,
  voice: <Mic size={12} color="#94a3b8" />,
  scan: <Camera size={12} color="#94a3b8" />,
};

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  // Edit modal state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editMerchant, setEditMerchant] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const typeFilter = selectedType === 'all' ? undefined : (selectedType as 'income' | 'expense');

  const { data, isLoading, refetch } = useApi(
    () => transactionsApi.listTransactions({
      type: typeFilter,
      search: searchQuery || undefined,
    }),
    [selectedType, searchQuery],
  );

  const transactions = data?.data ?? [];

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(String(Math.abs(tx.amount)));
    setEditMerchant(tx.merchant);
    setEditDate(tx.date?.split('T')[0] ?? '');
    setEditNotes('');
  };

  const handleUpdate = async () => {
    if (!editingTx || !editAmount || !editMerchant) return;
    setIsSaving(true);
    try {
      await transactionsApi.updateTransaction(editingTx.id, {
        amount: Number(editAmount),
        merchant: editMerchant,
        occurredAt: new Date(editDate).toISOString(),
      });
      setEditingTx(null);
      refetch();
    } catch (err: any) {
      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingTx) return;
    Alert.alert(
      language === 'en' ? 'Delete Transaction' : 'حذف المعاملة',
      language === 'en' ? 'Are you sure you want to delete this transaction?' : 'هل أنت متأكد من حذف هذه المعاملة؟',
      [
        { text: language === 'en' ? 'Cancel' : 'إلغاء', style: 'cancel' },
        {
          text: language === 'en' ? 'Delete' : 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionsApi.deleteTransaction(editingTx.id);
              setEditingTx(null);
              refetch();
            } catch (err: any) {
              Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed');
            }
          },
        },
      ],
    );
  };

  const renderTransaction = useCallback(({ item: tx }: { item: Transaction }) => (
    <Pressable onPress={() => openEdit(tx)} className="flex-row items-center justify-between py-3.5 px-4 border-b border-slate-50 active:bg-slate-50">
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {tx.type === 'income' ? (
            <TrendingUp size={18} color="#059669" />
          ) : (
            <TrendingDown size={18} color="#ef4444" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-slate-800 font-medium text-sm" numberOfLines={1}>{tx.merchant}</Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-slate-400 text-xs" numberOfLines={1}>{tx.category}</Text>
            {tx.method && (
              <View className="flex-row items-center ml-2">
                {methodIcons[tx.method]}
              </View>
            )}
            {tx.hasReceipt && (
              <View className="ml-1.5">
                <Paperclip size={10} color="#94a3b8" />
              </View>
            )}
          </View>
        </View>
      </View>
      <View className="items-end">
        <Text className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
          {tx.type === 'income' ? '+' : '-'}{currency} {Math.abs(tx.amount).toLocaleString()}
        </Text>
        <Text className="text-slate-400 text-[10px] mt-0.5">{tx.date}</Text>
      </View>
    </Pressable>
  ), [currency]);

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title={t('tabs.transactions')} />

      {/* Search Bar */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-white rounded-xl px-3 border border-slate-100">
          <Search size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 py-3 px-2 text-sm text-slate-800"
            placeholder={t('transactions.search')}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel={t('transactions.search')}
          />
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            accessibilityRole="button"
            accessibilityLabel="Filter"
            hitSlop={8}
            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Filter size={18} color={showFilters ? '#059669' : '#94a3b8'} />
          </Pressable>
        </View>
      </View>

      {/* Filter Chips */}
      {showFilters && (
        <View className="px-4 pb-2">
          <View className="flex-row gap-2">
            {[
              { key: 'all', label: t('transactions.all') },
              { key: 'income', label: t('addTransaction.income') },
              { key: 'expense', label: t('addTransaction.expense') },
            ].map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setSelectedType(f.key)}
                className={`px-4 py-2 rounded-full ${selectedType === f.key ? 'bg-emerald-600' : 'bg-white border border-slate-200'}`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedType === f.key }}
                accessibilityLabel={f.label}
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text className={`text-sm font-medium ${selectedType === f.key ? 'text-white' : 'text-slate-600'}`}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Transaction List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          className="flex-1 bg-white mx-4 rounded-2xl"
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-slate-400">{t('transactions.noTransactions')}</Text>
            </View>
          }
        />
      )}

      {/* Edit Transaction Modal */}
      <Modal
        visible={!!editingTx}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingTx(null)}
      >
        <Pressable
          onPress={() => setEditingTx(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: 20, width: '85%', maxWidth: 360, padding: 20 }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>
                {language === 'en' ? 'Edit Transaction' : 'تعديل المعاملة'}
              </Text>
              <Pressable onPress={() => setEditingTx(null)} hitSlop={8}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>

            {/* Amount */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
              {language === 'en' ? 'Amount' : 'المبلغ'}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 14,
              }}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
            />

            {/* Merchant */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
              {language === 'en' ? 'Merchant' : 'التاجر'}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 14,
              }}
              value={editMerchant}
              onChangeText={setEditMerchant}
              placeholder={language === 'en' ? 'Merchant name' : 'اسم التاجر'}
              placeholderTextColor="#94a3b8"
            />

            {/* Date */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 }}>
              {language === 'en' ? 'Date' : 'التاريخ'}
            </Text>
            <TextInput
              style={{
                backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1e293b', marginBottom: 20,
              }}
              value={editDate}
              onChangeText={setEditDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={handleDelete}
                style={{
                  backgroundColor: '#fef2f2', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Trash2 size={18} color="#ef4444" />
              </Pressable>
              <Pressable
                onPress={() => setEditingTx(null)}
                style={{
                  flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
                }}
              >
                <Text style={{ color: '#475569', fontWeight: '600' }}>
                  {language === 'en' ? 'Cancel' : 'إلغاء'}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleUpdate}
                disabled={isSaving}
                style={{
                  flex: 1, backgroundColor: isSaving ? '#6ee7b7' : '#059669', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
                }}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                    {language === 'en' ? 'Save' : 'حفظ'}
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
