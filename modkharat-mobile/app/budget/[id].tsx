import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { DimensionValue } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingDown, Calendar, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { mockBudgetDetail, mockBudgetTransactions, mockBudgetComparison } from '@/services/mock/data';

export default function BudgetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useApp();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const budget = mockBudgetDetail;
  const avgDailySpending = (budget.spent / 27).toFixed(0);
  const daysLeft = 3;
  const projectedTotal = budget.spent + Number(avgDailySpending) * daysLeft;
  const willExceed = projectedTotal > budget.limit;

  const statusColors = {
    good: ['#059669', '#047857'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626'],
  };

  const colors = statusColors[budget.status] || statusColors.good;

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={budget.name} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <LinearGradient colors={colors as [string, string]} className="mx-4 mt-4 rounded-2xl p-5">
          <Text className="text-white/70 text-sm mb-1">{budget.name}</Text>
          <Text className="text-white text-3xl font-bold mb-1">
            {currency} {budget.spent.toLocaleString()}
          </Text>
          <Text className="text-white/60 text-sm">
            {t('budgetDetail.spent')} {t('dashboard.of')} {currency} {budget.limit.toLocaleString()}
          </Text>
          {/* Progress Bar */}
          <View className="h-3 bg-white/20 rounded-full mt-4 overflow-hidden">
            <View
              className="h-full bg-white/80 rounded-full"
              style={{ width: `${Math.min(budget.progress, 100)}%` as DimensionValue }}
            />
          </View>
          <Text className="text-white/70 text-xs mt-1.5 text-right">{budget.progress}%</Text>
        </LinearGradient>

        {/* Stats Grid */}
        <View className="flex-row mx-4 mt-4 gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 items-center" accessibilityLabel={`${t('budgetDetail.remaining')}: ${currency} ${budget.remaining}`}>
            <Text className="text-slate-400 text-xs">{t('budgetDetail.remaining')}</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">{currency} {budget.remaining}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center" accessibilityLabel={`${t('budgetDetail.dailyAvg')}: ${currency} ${avgDailySpending}`}>
            <Text className="text-slate-400 text-xs">{t('budgetDetail.dailyAvg')}</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">{currency} {avgDailySpending}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 items-center" accessibilityLabel={`${t('budgetDetail.daysLeft')}: ${daysLeft}`}>
            <Text className="text-slate-400 text-xs">{t('budgetDetail.daysLeft')}</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">{daysLeft}</Text>
          </View>
        </View>

        {/* Alert */}
        <View
          className={`mx-4 mt-4 p-4 rounded-2xl flex-row items-center ${willExceed ? 'bg-red-50' : 'bg-emerald-50'}`}
          style={{ borderLeftWidth: 4, borderLeftColor: willExceed ? '#ef4444' : '#059669' }}
        >
          <AlertCircle size={18} color={willExceed ? '#ef4444' : '#059669'} />
          <Text className={`ml-3 text-sm flex-1 ${willExceed ? 'text-red-700' : 'text-emerald-700'}`}>
            {willExceed ? t('budgetDetail.overBudget') : t('budgetDetail.onTrack')}
          </Text>
        </View>

        {/* Monthly Comparison */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <Text className="text-slate-800 font-semibold text-base mb-4">{t('budgetDetail.comparison')}</Text>
          {mockBudgetComparison.map((m) => (
            <View key={m.month} className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-500 text-xs" numberOfLines={1}>{m.month}</Text>
                <Text className="text-slate-600 text-xs" numberOfLines={1}>
                  {currency} {m.actual.toLocaleString()} / {currency} {m.planned.toLocaleString()}
                </Text>
              </View>
              <View className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${(m.actual / m.planned) * 100}%` as DimensionValue,
                    backgroundColor: m.actual > m.planned ? '#ef4444' : '#059669',
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4">
          <Text className="text-slate-800 font-semibold text-base mb-3">{t('budgetDetail.recentTransactions')}</Text>
          {mockBudgetTransactions.map((tx, idx) => (
            <View
              key={tx.id}
              className="flex-row items-center justify-between py-3"
              style={idx < mockBudgetTransactions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : undefined}
            >
              <View>
                <Text className="text-slate-800 font-medium text-sm" numberOfLines={1}>{tx.merchant}</Text>
                <Text className="text-slate-400 text-xs">{tx.date}</Text>
              </View>
              <Text className="text-red-500 font-semibold text-sm">
                -{currency} {tx.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
