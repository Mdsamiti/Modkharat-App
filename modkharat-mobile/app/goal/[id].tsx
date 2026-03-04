import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import type { DimensionValue } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Edit, DollarSign } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { goalsApi } from '@/services/api';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useApp();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const { data: goalRes, isLoading: l1 } = useApi(() => goalsApi.getGoal(id!), [id]);
  const { data: contribRes, isLoading: l2 } = useApi(() => goalsApi.getContributions(id!), [id]);
  const { data: projRes, isLoading: l3 } = useApi(() => goalsApi.getProjection(id!), [id]);

  const goal = goalRes?.data;
  const contributions = contribRes?.data ?? [];
  const projection = projRes?.data ?? [];

  if (l1 || l2 || l3 || !goal) {
    return (
      <View className="flex-1 bg-slate-50">
        <ScreenHeader title={t('planner.goals')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </View>
    );
  }

  const remaining = goal.target - goal.saved;

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={goal.name} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <LinearGradient colors={['#059669', '#047857']} className="mx-4 mt-4 rounded-2xl p-5">
          <View className="flex-row items-center mb-3">
            <Text className="text-3xl mr-3">{goal.icon}</Text>
            <View>
              <Text className="text-white font-bold text-lg">{goal.name}</Text>
              {goal.account && <Text className="text-emerald-100 text-xs">{goal.account}</Text>}
            </View>
          </View>
          <Text className="text-white text-3xl font-bold">
            {currency} {goal.saved.toLocaleString()}
          </Text>
          <Text className="text-emerald-100 text-sm">
            {t('dashboard.of')} {currency} {goal.target.toLocaleString()}
          </Text>
          <View className="h-3 bg-white/20 rounded-full mt-4 overflow-hidden">
            <View
              className="h-full bg-white/80 rounded-full"
              style={{ width: `${goal.progress}%` as DimensionValue }}
            />
          </View>
          <Text className="text-white/70 text-xs mt-1.5 text-right">{goal.progress}%</Text>
        </LinearGradient>

        {/* Action Buttons */}
        <View className="flex-row mx-4 mt-4 gap-3">
          <Pressable className="flex-1 bg-emerald-600 rounded-xl py-3.5 flex-row items-center justify-center active:bg-emerald-700" accessibilityRole="button" accessibilityLabel={t('goalDetail.addFunds')}>
            <DollarSign size={18} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">{t('goalDetail.addFunds')}</Text>
          </Pressable>
          <Pressable className="flex-1 bg-white border border-slate-200 rounded-xl py-3.5 flex-row items-center justify-center active:bg-slate-50" accessibilityRole="button" accessibilityLabel={t('goalDetail.editGoal')}>
            <Edit size={18} color="#64748b" />
            <Text className="text-slate-700 font-semibold ml-2">{t('goalDetail.editGoal')}</Text>
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap mx-4 mt-4 gap-3">
          <View className="bg-white rounded-2xl p-4 items-center" style={{ width: '47%' }}>
            <Text className="text-slate-400 text-xs">{t('goalDetail.remaining')}</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">{currency} {remaining.toLocaleString()}</Text>
          </View>
          <View className="bg-white rounded-2xl p-4 items-center" style={{ width: '47%' }}>
            <Text className="text-slate-400 text-xs">{t('goalDetail.monthly')}</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">{currency} {(goal.monthlyContribution || 0).toLocaleString()}</Text>
          </View>
          {goal.targetDate && (
            <View className="bg-white rounded-2xl p-4 items-center" style={{ width: '47%' }}>
              <Text className="text-slate-400 text-xs">{t('goalDetail.targetDate')}</Text>
              <Text className="text-slate-800 font-bold text-sm mt-1">
                {new Date(goal.targetDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}
          {goal.estimatedCompletion && (
            <View className="bg-white rounded-2xl p-4 items-center" style={{ width: '47%' }}>
              <Text className="text-slate-400 text-xs">{t('goalDetail.estimatedCompletion')}</Text>
              <Text className="text-emerald-600 font-bold text-sm mt-1">
                {new Date(goal.estimatedCompletion).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* Savings Projection */}
        {projection.length > 0 && (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
            <Text className="text-slate-800 font-semibold text-base mb-4">{t('goalDetail.projection')}</Text>
            {projection.map((p) => {
              const val = p.actual ?? p.projected;
              const pct = (val / goal.target) * 100;
              const isProjected = p.actual === null;
              return (
                <View key={p.month} className="mb-2">
                  <View className="flex-row justify-between mb-0.5">
                    <Text className="text-slate-500 text-xs">{p.month}</Text>
                    <Text className={`text-xs ${isProjected ? 'text-slate-400' : 'text-emerald-600'} font-medium`}>
                      {currency} {val.toLocaleString()}
                    </Text>
                  </View>
                  <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%` as DimensionValue,
                        backgroundColor: isProjected ? '#94a3b8' : '#059669',
                        opacity: isProjected ? 0.5 : 1,
                      }}
                    />
                  </View>
                </View>
              );
            })}
            <View className="flex-row justify-center mt-3 gap-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-emerald-500 rounded-full mr-1.5" />
                <Text className="text-slate-500 text-xs">{language === 'en' ? 'Actual' : 'فعلي'}</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-slate-300 rounded-full mr-1.5" />
                <Text className="text-slate-500 text-xs">{language === 'en' ? 'Projected' : 'متوقع'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Contributions */}
        {contributions.length > 0 && (
          <View className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4">
            <Text className="text-slate-800 font-semibold text-base mb-3">{t('goalDetail.contributions')}</Text>
            {contributions.map((c, idx) => (
              <View
                key={c.date}
                className="flex-row items-center justify-between py-3"
                style={idx < contributions.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : undefined}
              >
                <View>
                  <Text className="text-slate-800 font-medium text-sm" numberOfLines={1}>+{currency} {c.amount.toLocaleString()}</Text>
                  <Text className="text-slate-400 text-xs">{c.date}</Text>
                </View>
                <Text className="text-slate-500 text-sm">{currency} {c.balance.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
