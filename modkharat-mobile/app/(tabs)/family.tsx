import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import type { DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/AppHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { householdsApi, goalsApi, budgetsApi } from '@/services/api';

export default function FamilyScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const { data: householdsData, isLoading: l1 } = useApi(() => householdsApi.listHouseholds(), []);
  const householdId = householdsData?.data?.[0]?.id;

  const { data: membersData, isLoading: l2 } = useApi(
    () => householdId ? householdsApi.getMembers(householdId) : Promise.resolve({ data: [] }),
    [householdId],
  );
  const { data: goalsData, isLoading: l3 } = useApi(() => goalsApi.listGoals(), []);
  const { data: budgetData, isLoading: l4 } = useApi(() => budgetsApi.listBudgets(), []);

  const members = membersData?.data ?? [];
  const goals = goalsData?.data ?? [];
  const budgets = budgetData?.data ?? [];

  const isLoading = l1 || l2 || l3 || l4;

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title={t('family.title')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title={t('family.title')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          className="mx-4 mt-4 rounded-2xl p-5"
        >
          <View className="flex-row items-center mb-3">
            <Users size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">{t('family.title')}</Text>
          </View>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-blue-100 text-xs">{t('family.members')}</Text>
              <Text className="text-white text-xl font-bold">{members.length}</Text>
            </View>
            <View className="items-end">
              <Text className="text-blue-100 text-xs">{t('family.sharedGoals')}</Text>
              <Text className="text-white text-xl font-bold">{goals.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Family Members */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-800 font-semibold text-base">{t('family.members')}</Text>
            <Pressable onPress={() => router.push('/family/members')} accessibilityRole="link" accessibilityLabel={t('family.viewMembers')} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text className="text-blue-600 text-sm font-medium">{t('family.viewMembers')}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {members.map((member) => (
              <View key={member.id} className="items-center">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-1"
                  style={{ backgroundColor: member.color + '20' }}
                >
                  <Text className="text-2xl">{member.avatar}</Text>
                </View>
                <Text className="text-slate-600 text-xs" numberOfLines={1} style={{ maxWidth: 60 }}>{member.name}</Text>
                <Text className="text-slate-400 text-[10px] capitalize">
                  {language === 'en' ? member.role : (member.role === 'organizer' ? t('familyMembers.organizer') : t('familyMembers.member'))}
                </Text>
              </View>
            ))}
            <Pressable className="items-center" accessibilityRole="button" accessibilityLabel={t('family.invite')}>
              <View className="w-14 h-14 rounded-full items-center justify-center mb-1 border-2 border-dashed border-slate-200">
                <Plus size={20} color="#94a3b8" />
              </View>
              <Text className="text-slate-400 text-xs">{t('family.invite')}</Text>
            </Pressable>
          </View>
          </ScrollView>
        </View>

        {/* Shared Goals */}
        {goals.length > 0 && (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
            <Text className="text-slate-800 font-semibold text-base mb-3">{t('family.sharedGoals')}</Text>
            {goals.map((goal) => (
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
                    className="h-full bg-blue-500 rounded-full"
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
        )}

        {/* Shared Budgets */}
        {budgets.length > 0 && (
          <View className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4">
            <Text className="text-slate-800 font-semibold text-base mb-3">{t('family.sharedBudgets')}</Text>
            {budgets.map((budget) => {
              const statusColor = budget.status === 'good' ? '#059669' : budget.status === 'warning' ? '#f59e0b' : '#ef4444';
              return (
                <View key={budget.id} className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-slate-700 font-medium text-sm">{budget.name}</Text>
                    <Text className="text-slate-500 text-xs">
                      {currency} {budget.spent.toLocaleString()} / {currency} {budget.limit.toLocaleString()}
                    </Text>
                  </View>
                  <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${budget.progress}%` as DimensionValue, backgroundColor: statusColor }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
