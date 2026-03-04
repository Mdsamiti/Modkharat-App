import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import type { DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Plus, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { analyticsApi, budgetsApi } from '@/services/api';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const { data: overview, isLoading: l1 } = useApi(() => analyticsApi.getOverview(), []);
  const { data: categoryData, isLoading: l2 } = useApi(() => analyticsApi.getSpendingByCategory(), []);
  const { data: incExpData, isLoading: l3 } = useApi(() => analyticsApi.getIncomeVsExpenses(), []);
  const { data: budgetData, isLoading: l4 } = useApi(() => budgetsApi.listBudgets(), []);

  const income = overview?.data?.income ?? 0;
  const expenses = overview?.data?.expenses ?? 0;
  const savingsRate = income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : '0';
  const spendingByCategory = categoryData?.data ?? [];
  const incomeVsExpenses = incExpData?.data ?? [];
  const budgets = budgetData?.data ?? [];
  const totalSpending = spendingByCategory.reduce((s, c) => s + c.value, 0);

  const isLoading = l1 || l2 || l3 || l4;

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title={t('tabs.analytics')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title={t('tabs.analytics')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View className="flex-row px-4 mt-4 gap-3">
          <View className="flex-1 bg-emerald-50 rounded-2xl p-4" accessibilityLabel={`${t('analytics.totalIncome')}: ${currency} ${income.toLocaleString()}`}>
            <View className="flex-row items-center mb-2">
              <TrendingUp size={16} color="#059669" />
              <Text className="text-emerald-700 text-xs ml-1" numberOfLines={1}>{t('analytics.totalIncome')}</Text>
            </View>
            <Text className="text-emerald-800 font-bold text-lg" numberOfLines={1}>{currency} {income.toLocaleString()}</Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-2xl p-4" accessibilityLabel={`${t('analytics.totalExpenses')}: ${currency} ${expenses.toLocaleString()}`}>
            <View className="flex-row items-center mb-2">
              <TrendingDown size={16} color="#ef4444" />
              <Text className="text-red-700 text-xs ml-1" numberOfLines={1}>{t('analytics.totalExpenses')}</Text>
            </View>
            <Text className="text-red-800 font-bold text-lg" numberOfLines={1}>{currency} {expenses.toLocaleString()}</Text>
          </View>
        </View>

        {/* Savings Rate */}
        <View className="mx-4 mt-3 bg-blue-50 rounded-2xl p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Wallet size={18} color="#3b82f6" />
            <Text className="text-blue-700 text-sm ml-2">{t('analytics.savingsRate')}</Text>
          </View>
          <Text className="text-blue-800 font-bold text-lg">{savingsRate}%</Text>
        </View>

        {/* Spending by Category */}
        {spendingByCategory.length > 0 && (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
            <Text className="text-slate-800 font-semibold text-base mb-4">{t('analytics.spendingByCategory')}</Text>
            {spendingByCategory.map((cat) => {
              const pct = totalSpending > 0 ? ((cat.value / totalSpending) * 100).toFixed(1) : '0';
              return (
                <View key={cat.name.en} className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-slate-600 text-sm">
                      {language === 'en' ? cat.name.en : cat.name.ar}
                    </Text>
                    <Text className="text-slate-800 text-sm font-semibold">
                      {currency} {cat.value.toLocaleString()} ({pct}%)
                    </Text>
                  </View>
                  <View className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${pct}%` as DimensionValue, backgroundColor: cat.color }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Income vs Expenses Chart */}
        {incomeVsExpenses.length > 0 && (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
            <Text className="text-slate-800 font-semibold text-base mb-4">{t('analytics.incomeVsExpenses')}</Text>
            {incomeVsExpenses.map((m) => (
              <View key={m.month} className="mb-3">
                <Text className="text-slate-500 text-xs mb-1.5">{m.month}</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <View className="h-4 bg-emerald-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(m.income / 15000) * 100}%` as DimensionValue }}
                      />
                    </View>
                  </View>
                  <View className="flex-1">
                    <View className="h-4 bg-red-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${(m.expense / 15000) * 100}%` as DimensionValue }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <View className="flex-row justify-center mt-2 gap-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-emerald-500 rounded-full mr-1.5" />
                <Text className="text-slate-500 text-xs">{t('addTransaction.income')}</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-red-400 rounded-full mr-1.5" />
                <Text className="text-slate-500 text-xs">{t('addTransaction.expense')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Budgets */}
        <View className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4">
          <Text className="text-slate-800 font-semibold text-base mb-4">{t('analytics.budgets')}</Text>
          {budgets.map((budget) => {
            const statusColor = budget.status === 'good' ? '#059669' : budget.status === 'warning' ? '#f59e0b' : '#ef4444';
            return (
              <Pressable
                key={budget.id}
                onPress={() => router.push(`/budget/${budget.id}`)}
                className="mb-4 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel={`${budget.name}, ${budget.progress.toFixed(1)}%`}
              >
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-700 font-medium text-sm">{budget.name}</Text>
                  <Text className="text-slate-500 text-xs">
                    {currency} {budget.spent.toLocaleString()} / {currency} {budget.limit.toLocaleString()}
                  </Text>
                </View>
                <View className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${budget.progress}%` as DimensionValue, backgroundColor: statusColor }}
                  />
                </View>
                <Text className="text-xs mt-1" style={{ color: statusColor }}>
                  {budget.progress.toFixed(1)}%
                </Text>
              </Pressable>
            );
          })}

          <Pressable className="border-2 border-dashed border-slate-200 rounded-xl py-4 items-center flex-row justify-center" accessibilityRole="button" accessibilityLabel={t('analytics.createBudget')}>
            <Plus size={18} color="#94a3b8" />
            <Text className="text-slate-400 font-medium ml-2">{t('analytics.createBudget')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
