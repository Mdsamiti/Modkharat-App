import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import type { DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { useResponsive } from '@/utils/useResponsive';
import {
  mockBalance, mockIncome, mockExpenses, mockBudgetTotal,
  mockCategories, mockGoals, mockRecentTransactions,
} from '@/services/mock/data';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const { isCompact } = useResponsive();
  const isRTL = language === 'ar';
  const currency = language === 'en' ? 'SAR' : 'ر.س';
  const budgetPercent = ((mockExpenses / mockBudgetTotal) * 100).toFixed(1);

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title={t('tabs.dashboard')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient
          colors={['#059669', '#047857']}
          className="mx-4 mt-4 rounded-2xl p-5"
        >
          <Text className="text-emerald-100 text-sm mb-1" accessibilityRole="text">{t('dashboard.totalBalance')}</Text>
          <Text className={`text-white font-bold mb-4 ${isCompact ? 'text-2xl' : 'text-3xl'}`} accessibilityLabel={`${t('dashboard.totalBalance')}: ${currency} ${mockBalance.toLocaleString()}`}>
            {currency} {mockBalance.toLocaleString()}
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
                <TrendingUp size={16} color="#ffffff" />
              </View>
              <View>
                <Text className="text-emerald-100 text-xs">{t('dashboard.income')}</Text>
                <Text className="text-white font-semibold">{currency} {mockIncome.toLocaleString()}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
                <TrendingDown size={16} color="#ffffff" />
              </View>
              <View>
                <Text className="text-emerald-100 text-xs">{t('dashboard.expenses')}</Text>
                <Text className="text-white font-semibold">{currency} {mockExpenses.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Budget Used */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-slate-600 text-sm">{t('dashboard.budgetUsed')}</Text>
            <Text className="text-slate-800 font-semibold">{budgetPercent}%</Text>
          </View>
          <View className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${budgetPercent}%` as DimensionValue }}
            />
          </View>
          <Text className="text-slate-400 text-xs mt-1.5">
            {currency} {mockExpenses.toLocaleString()} {t('dashboard.of')} {currency} {mockBudgetTotal.toLocaleString()}
          </Text>
        </View>

        {/* Top Categories */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <Text className="text-slate-800 font-semibold text-base mb-3">{t('dashboard.categories')}</Text>
          {mockCategories.map((cat) => (
            <View key={cat.id} className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">{cat.icon}</Text>
                <View className="flex-1">
                  <Text className="text-slate-700 text-sm font-medium">
                    {language === 'en' ? cat.name.en : cat.name.ar}
                  </Text>
                  <View className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${(cat.amount / mockExpenses) * 100}%` as DimensionValue, backgroundColor: cat.color }}
                    />
                  </View>
                </View>
              </View>
              <Text className="text-slate-800 font-semibold text-sm ml-3">
                {currency} {cat.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Saving Goals */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-800 font-semibold text-base">{t('dashboard.goals')}</Text>
            <Pressable onPress={() => router.push('/(tabs)/planner')} accessibilityRole="link" accessibilityLabel={t('dashboard.viewAll')} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text className="text-emerald-600 text-sm font-medium">{t('dashboard.viewAll')}</Text>
            </Pressable>
          </View>
          {mockGoals.map((goal) => (
            <Pressable
              key={goal.id}
              onPress={() => router.push(`/goal/${goal.id}`)}
              className="mb-3 p-3 bg-slate-50 rounded-xl active:bg-slate-100"
              accessibilityRole="button"
              accessibilityLabel={`${goal.name}, ${goal.progress}%`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">{goal.icon}</Text>
                  <Text className="text-slate-700 font-medium">{goal.name}</Text>
                </View>
                <Text className="text-slate-500 text-xs">{goal.progress}%</Text>
              </View>
              <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${goal.progress}%` as DimensionValue }}
                />
              </View>
              <View className="flex-row justify-between mt-1.5">
                <Text className="text-slate-400 text-xs">{currency} {goal.saved.toLocaleString()}</Text>
                <Text className="text-slate-400 text-xs">{currency} {goal.target.toLocaleString()}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Recent Transactions */}
        <View className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-800 font-semibold text-base">{t('dashboard.recentTransactions')}</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')} accessibilityRole="link" accessibilityLabel={t('dashboard.viewAll')} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text className="text-emerald-600 text-sm font-medium">{t('dashboard.viewAll')}</Text>
            </Pressable>
          </View>
          {mockRecentTransactions.map((tx) => (
            <View key={tx.id} className="flex-row items-center justify-between py-3 border-b border-slate-50">
              <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {tx.type === 'income' ? (
                    <ArrowUpRight size={18} color="#059669" />
                  ) : (
                    <ArrowDownRight size={18} color="#ef4444" />
                  )}
                </View>
                <View>
                  <Text className="text-slate-800 font-medium text-sm">{tx.merchant}</Text>
                  <Text className="text-slate-400 text-xs">{tx.category}</Text>
                </View>
              </View>
              <Text className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                {tx.type === 'income' ? '+' : ''}{currency} {Math.abs(tx.amount).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
