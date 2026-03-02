import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, DollarSign, Calendar, Wallet, Sparkles, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { mockGoalPresets, mockAccounts } from '@/services/mock/data';

export default function NewGoalScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const [step, setStep] = useState(1);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('savings');

  const recommendation = useMemo(() => {
    const amount = Number(targetAmount);
    if (!amount || !targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const monthsDiff = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthlyAmount = Math.ceil(amount / monthsDiff);
    return { monthlyAmount, monthsDiff, isRealistic: monthlyAmount <= 5000 };
  }, [targetAmount, targetDate]);

  const stepIcons = [Target, DollarSign, Calendar, Wallet];

  const canContinue = () => {
    switch (step) {
      case 1: return goalName.length > 0 && Number(targetAmount) > 0;
      case 2: return targetDate.length > 0;
      case 3: return selectedAccount.length > 0;
      default: return true;
    }
  };

  const quickDates = [
    { label: t('newGoal.months6'), months: 6 },
    { label: t('newGoal.year1'), months: 12 },
    { label: t('newGoal.years2'), months: 24 },
  ];

  const setQuickDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white border-b border-slate-100 px-4 pb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-800">{t('newGoal.title')}</Text>
          <Pressable onPress={() => router.back()} className="p-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44 }}>
            <X size={22} color="#1e293b" />
          </Pressable>
        </View>
      </View>

      {/* Progress Steps */}
      <View className="flex-row px-8 py-4 justify-between">
        {[1, 2, 3, 4].map((s) => (
          <View key={s} className="flex-row items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                s <= step ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold ${s <= step ? 'text-white' : 'text-slate-400'}`}>{s}</Text>
            </View>
            {s < 4 && (
              <View className={`h-0.5 w-12 ${s < step ? 'bg-emerald-600' : 'bg-slate-200'}`} />
            )}
          </View>
        ))}
      </View>

      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        {/* Step 1: Name & Amount */}
        {step === 1 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-1">{t('newGoal.step1')}</Text>
            <Text className="text-slate-500 text-sm mb-6">{language === 'en' ? "What are you saving for?" : "ما الذي تدخر من أجله؟"}</Text>

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('newGoal.goalName')}</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={goalName}
              onChangeText={setGoalName}
              placeholder={t('newGoal.goalName')}
              placeholderTextColor="#94a3b8"
              accessibilityLabel={t('newGoal.goalName')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('newGoal.targetAmount')}</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              accessibilityLabel={t('newGoal.targetAmount')}
            />

            <Text className="text-slate-500 text-sm mb-3">{t('newGoal.orChoosePreset')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {mockGoalPresets.map((preset) => (
                <Pressable
                  key={preset.name.en}
                  onPress={() => {
                    setGoalName(language === 'en' ? preset.name.en : preset.name.ar);
                    setTargetAmount(String(preset.suggestedAmount));
                  }}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 items-center active:bg-slate-50"
                  style={{ width: '31%' }}
                  accessibilityRole="button"
                  accessibilityLabel={language === 'en' ? preset.name.en : preset.name.ar}
                >
                  <Text className="text-2xl mb-1">{preset.icon}</Text>
                  <Text className="text-slate-600 text-xs text-center" numberOfLines={1}>
                    {language === 'en' ? preset.name.en : preset.name.ar}
                  </Text>
                  <Text className="text-slate-400 text-[10px]">
                    {currency} {(preset.suggestedAmount / 1000).toFixed(0)}K
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Target Date */}
        {step === 2 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-1">{t('newGoal.step2')}</Text>
            <Text className="text-slate-500 text-sm mb-6">{t('newGoal.when')}</Text>

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('newGoal.chooseDate')}</Text>
            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              accessibilityLabel={t('newGoal.chooseDate')}
            />

            <Text className="text-slate-500 text-sm mb-3">{t('newGoal.quickOptions')}</Text>
            <View className="flex-row gap-3">
              {quickDates.map((d) => (
                <Pressable
                  key={d.months}
                  onPress={() => setQuickDate(d.months)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl py-3 items-center active:bg-emerald-50"
                  accessibilityRole="button"
                  accessibilityLabel={d.label}
                >
                  <Text className="text-slate-700 font-medium text-sm">{d.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Account */}
        {step === 3 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-1">{t('newGoal.step3')}</Text>
            <Text className="text-slate-500 text-sm mb-6">{t('newGoal.selectAccount')}</Text>

            {mockAccounts.map((acc) => (
              <Pressable
                key={acc.id}
                onPress={() => setSelectedAccount(acc.id)}
                className={`flex-row items-center p-4 rounded-xl mb-3 ${
                  selectedAccount === acc.id ? 'bg-emerald-50 border-2 border-emerald-600' : 'bg-white border border-slate-200'
                }`}
                accessibilityRole="button"
                accessibilityLabel={language === 'en' ? acc.name.en : acc.name.ar}
              >
                <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  selectedAccount === acc.id ? 'border-emerald-600' : 'border-slate-300'
                }`}>
                  {selectedAccount === acc.id && <View className="w-2.5 h-2.5 bg-emerald-600 rounded-full" />}
                </View>
                <Text className={`font-medium ${selectedAccount === acc.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {language === 'en' ? acc.name.en : acc.name.ar}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <View>
            <Text className="text-xl font-bold text-slate-800 mb-1">{t('newGoal.step4')}</Text>
            <Text className="text-slate-500 text-sm mb-6">{language === 'en' ? 'Review your goal details' : 'راجع تفاصيل هدفك'}</Text>

            {/* AI Recommendation */}
            {recommendation && (
              <LinearGradient colors={['#059669', '#047857']} className="rounded-2xl p-5 mb-4">
                <View className="flex-row items-center mb-3">
                  <Sparkles size={18} color="#ffffff" />
                  <Text className="text-white font-semibold ml-2">{t('newGoal.recommendation')}</Text>
                </View>
                <Text className="text-emerald-100 text-sm mb-1">{t('newGoal.monthlyContribution')}</Text>
                <Text className="text-white text-2xl font-bold mb-2">
                  {currency} {recommendation.monthlyAmount.toLocaleString()}
                </Text>
                <Text className={`text-sm ${recommendation.isRealistic ? 'text-emerald-100' : 'text-yellow-200'}`}>
                  {recommendation.isRealistic ? t('newGoal.realistic') : t('newGoal.ambitious')}
                </Text>
              </LinearGradient>
            )}

            {/* Summary */}
            <View className="bg-white rounded-2xl p-4">
              {[
                { label: t('newGoal.goalName'), value: goalName },
                { label: t('newGoal.targetAmount'), value: `${currency} ${Number(targetAmount).toLocaleString()}` },
                { label: t('newGoal.chooseDate'), value: targetDate },
                {
                  label: t('newGoal.selectAccount'),
                  value: (() => {
                    const acc = mockAccounts.find((a) => a.id === selectedAccount);
                    return acc ? (language === 'en' ? acc.name.en : acc.name.ar) : '';
                  })(),
                },
              ].map((row, idx) => (
                <View
                  key={row.label}
                  className="flex-row justify-between py-3"
                  style={idx < 3 ? { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' } : undefined}
                >
                  <Text className="text-slate-500 text-sm">{row.label}</Text>
                  <Text className="text-slate-800 font-medium text-sm">{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row gap-3">
          {step > 1 && (
            <Pressable
              onPress={() => setStep(step - 1)}
              className="flex-1 bg-white border border-slate-200 py-4 rounded-xl items-center active:bg-slate-50"
              accessibilityRole="button"
              accessibilityLabel={t('newGoal.previous')}
            >
              <Text className="text-slate-700 font-semibold">{t('newGoal.previous')}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (step < 4) setStep(step + 1);
              else router.back();
            }}
            className={`flex-1 py-4 rounded-xl items-center ${canContinue() ? 'bg-emerald-600 active:bg-emerald-700' : 'bg-slate-200'}`}
            disabled={!canContinue()}
            accessibilityRole="button"
            accessibilityLabel={step < 4 ? t('newGoal.next') : t('newGoal.createGoal')}
          >
            <Text className={`font-semibold ${canContinue() ? 'text-white' : 'text-slate-400'}`}>
              {step < 4 ? t('newGoal.next') : t('newGoal.createGoal')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
