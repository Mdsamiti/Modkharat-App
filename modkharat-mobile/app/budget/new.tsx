import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, ChevronDown, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { budgetsApi, categoriesApi } from '@/services/api';

type Period = 'weekly' | 'monthly' | 'yearly';

export default function NewBudgetScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string; editName?: string; editLimit?: string; editPeriod?: string }>();

  const isEdit = !!params.editId;
  const isRTL = language === 'ar';

  const [name, setName] = useState(params.editName ?? '');
  const [limitAmount, setLimitAmount] = useState(params.editLimit ?? '');
  const [period, setPeriod] = useState<Period>((params.editPeriod as Period) ?? 'monthly');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { data: catData } = useApi(() => categoriesApi.listCategories(), []);
  const categories = catData?.data ?? [];

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const periods: { key: Period; label: string }[] = [
    { key: 'weekly', label: t('budgetForm.weekly') },
    { key: 'monthly', label: t('budgetForm.monthly') },
    { key: 'yearly', label: t('budgetForm.yearly') },
  ];

  const validate = () => {
    const newErrors: { name?: string; amount?: string } = {};
    if (!name.trim()) newErrors.name = t('budgetForm.nameRequired');
    if (!limitAmount.trim()) newErrors.amount = t('budgetForm.amountRequired');
    else if (isNaN(Number(limitAmount)) || Number(limitAmount) <= 0) newErrors.amount = t('budgetForm.amountInvalid');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await budgetsApi.updateBudget(params.editId!, {
          name: name.trim(),
          limitAmount: Number(limitAmount),
          categoryId: categoryId,
          period,
        });
      } else {
        await budgetsApi.createBudget({
          name: name.trim(),
          limitAmount: Number(limitAmount),
          categoryId: categoryId ?? undefined,
          period,
        });
      }
      router.back();
    } catch (err: any) {
      Alert.alert(
        language === 'en' ? 'Error' : 'خطأ',
        err?.message || (language === 'en' ? 'Failed to save budget' : 'فشل في حفظ الميزانية'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={isEdit ? t('budgetForm.editTitle') : t('budgetForm.createTitle')} />
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        {/* Budget Name */}
        <View className="mt-4">
          <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('budgetForm.budgetName')}</Text>
          <TextInput
            className={`bg-white rounded-xl px-4 py-3.5 text-base text-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
            placeholder={t('budgetForm.budgetNamePlaceholder')}
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            textAlign={isRTL ? 'right' : 'left'}
          />
          {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
        </View>

        {/* Limit Amount */}
        <View className="mt-4">
          <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('budgetForm.limitAmount')}</Text>
          <TextInput
            className={`bg-white rounded-xl px-4 py-3.5 text-base text-slate-800 border ${errors.amount ? 'border-red-500' : 'border-slate-200'}`}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            value={limitAmount}
            onChangeText={setLimitAmount}
            keyboardType="decimal-pad"
            textAlign={isRTL ? 'right' : 'left'}
          />
          {errors.amount && <Text className="text-red-500 text-xs mt-1">{errors.amount}</Text>}
        </View>

        {/* Category Picker */}
        <View className="mt-4">
          <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('budgetForm.category')}</Text>
          <Pressable
            onPress={() => setShowCategoryPicker(true)}
            className="bg-white rounded-xl px-4 py-3.5 border border-slate-200 flex-row items-center justify-between"
          >
            <Text className={`text-base ${selectedCategory ? 'text-slate-800' : 'text-slate-400'}`}>
              {selectedCategory
                ? (language === 'en' ? selectedCategory.nameEn : selectedCategory.nameAr)
                : t('budgetForm.selectCategory')}
            </Text>
            <ChevronDown size={18} color="#94a3b8" />
          </Pressable>
        </View>

        {/* Period Selector */}
        <View className="mt-4">
          <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('budgetForm.period')}</Text>
          <View className="flex-row gap-2">
            {periods.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setPeriod(p.key)}
                className={`flex-1 py-3 rounded-xl items-center border ${
                  period === p.key
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`font-medium text-sm ${
                    period === p.key ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`mt-8 mb-6 py-4 rounded-xl items-center ${isSubmitting ? 'bg-emerald-400' : 'bg-emerald-600 active:bg-emerald-700'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {isEdit ? t('budgetForm.updateBudget') : t('budgetForm.createBudget')}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal visible={showCategoryPicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800">{t('budgetForm.category')}</Text>
              <Pressable onPress={() => setShowCategoryPicker(false)} hitSlop={8}>
                <X size={22} color="#64748b" />
              </Pressable>
            </View>
            {/* No category option */}
            <Pressable
              onPress={() => { setCategoryId(null); setShowCategoryPicker(false); }}
              className="flex-row items-center px-4 py-3.5 border-b border-slate-50"
            >
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Text className="text-slate-400">—</Text>
              </View>
              <Text className="flex-1 text-slate-600 text-base">{t('budgetForm.noCategory')}</Text>
              {categoryId === null && <Check size={18} color="#059669" />}
            </Pressable>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { setCategoryId(item.id); setShowCategoryPicker(false); }}
                  className="flex-row items-center px-4 py-3.5 border-b border-slate-50"
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <Text>{item.icon}</Text>
                  </View>
                  <Text className="flex-1 text-slate-800 text-base">
                    {language === 'en' ? item.nameEn : item.nameAr}
                  </Text>
                  {categoryId === item.id && <Check size={18} color="#059669" />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
