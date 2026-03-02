import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, FlatList } from 'react-native';
import { Search, Filter, ChevronDown, Edit3, MessageSquare, Mic, Camera, Paperclip, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { mockTransactions } from '@/services/mock/data';
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

  const filtered = useMemo(() => {
    let result = mockTransactions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) => tx.merchant.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'all') {
      result = result.filter((tx) => tx.type === selectedType);
    }
    return result;
  }, [searchQuery, selectedType]);

  const renderTransaction = ({ item: tx }: { item: Transaction }) => (
    <View className="flex-row items-center justify-between py-3.5 px-4 border-b border-slate-50">
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
    </View>
  );

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
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        className="flex-1 bg-white mx-4 rounded-2xl"
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="text-slate-400">{t('transactions.noTransactions')}</Text>
          </View>
        }
      />
    </View>
  );
}
