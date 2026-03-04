import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import type { DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Plus, TrendingUp, Calendar, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { useResponsive } from '@/utils/useResponsive';
import { useApi } from '@/hooks/useApi';
import { goalsApi } from '@/services/api';

export default function PlannerScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const { isCompact } = useResponsive();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const { data, isLoading } = useApi(() => goalsApi.listGoals(), []);
  const goals = data?.data ?? [];

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const totalMonthly = goals.reduce((sum, g) => sum + (g.monthlyContribution || 0), 0);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title={t('planner.title')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title={t('planner.title')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <LinearGradient
          colors={['#059669', '#047857']}
          className="mx-4 mt-4 rounded-2xl p-5"
        >
          <View className="flex-row items-center mb-3">
            <Target size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">{t('planner.title')}</Text>
          </View>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-emerald-100 text-xs">{t('planner.totalSaved')}</Text>
              <Text className="text-white text-2xl font-bold">{currency} {totalSaved.toLocaleString()}</Text>
            </View>
            <View className="items-end">
              <Text className="text-emerald-100 text-xs">{t('planner.monthlyTarget')}</Text>
              <Text className="text-white text-lg font-semibold">{currency} {totalMonthly.toLocaleString()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* New Goal Button */}
        <Pressable
          onPress={() => router.push('/goal/new')}
          className="mx-4 mt-4 bg-emerald-600 rounded-2xl py-4 flex-row items-center justify-center active:bg-emerald-700"
          accessibilityRole="button"
          accessibilityLabel={t('planner.newGoal')}
        >
          <Plus size={20} color="#ffffff" />
          <Text className="text-white font-semibold ml-2">{t('planner.newGoal')}</Text>
        </Pressable>

        {/* Goals List */}
        <View className="mx-4 mt-4 mb-6">
          <Text className="text-slate-800 font-semibold text-base mb-3">{t('planner.goals')}</Text>
          {goals.map((goal) => {
            const progressColor = goal.progress >= 75 ? '#059669' : goal.progress >= 50 ? '#3b82f6' : '#f59e0b';
            return (
              <Pressable
                key={goal.id}
                onPress={() => router.push(`/goal/${goal.id}`)}
                className="bg-white rounded-2xl p-4 mb-3 active:bg-slate-50"
                accessibilityRole="button"
                accessibilityLabel={`${goal.name}, ${goal.progress.toFixed(1)}%`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">{goal.icon}</Text>
                    <View>
                      <Text className="text-slate-800 font-semibold" numberOfLines={1}>{goal.name}</Text>
                      <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                        {currency} {goal.saved.toLocaleString()} / {currency} {goal.target.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-lg font-bold" style={{ color: progressColor }}>
                    {goal.progress.toFixed(1)}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${goal.progress}%` as DimensionValue, backgroundColor: progressColor }}
                  />
                </View>

                {/* Stats Row */}
                <View className={`${isCompact ? 'flex-col gap-1' : 'flex-row justify-between'}`}>
                  <View className="flex-row items-center">
                    <Wallet size={12} color="#94a3b8" />
                    <Text className="text-slate-500 text-xs ml-1" numberOfLines={1}>
                      {t('planner.monthly')}: {currency} {(goal.monthlyContribution || 0).toLocaleString()}
                    </Text>
                  </View>
                  {goal.targetDate && (
                    <View className="flex-row items-center">
                      <Calendar size={12} color="#94a3b8" />
                      <Text className="text-slate-500 text-xs ml-1">
                        {new Date(goal.targetDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  )}
                  {goal.estimatedCompletion && (
                    <View className="flex-row items-center bg-purple-50 px-2 py-0.5 rounded-full">
                      <TrendingUp size={10} color="#7c3aed" />
                      <Text className="text-purple-600 text-[10px] font-medium ml-1">
                        {t('planner.aiEstimate')}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
          {goals.length === 0 && (
            <Text className="text-slate-400 text-center py-8">{language === 'en' ? 'No goals yet' : 'لا توجد أهداف بعد'}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
