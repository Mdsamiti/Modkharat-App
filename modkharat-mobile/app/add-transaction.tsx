import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X, ArrowUpRight, ArrowDownRight, Edit3, MessageSquare, Mic, Camera,
  Check, ArrowLeft,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { categoriesApi, transactionsApi } from '@/services/api';
import type { TransactionType, CaptureMethod } from '@/types/models';

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const { language } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currency = language === 'en' ? 'SAR' : 'ر.س';

  const { data: catData } = useApi(() => categoriesApi.listCategories(), []);
  const { data: accData } = useApi(() => categoriesApi.listAccounts(), []);

  const categories = catData?.data ?? [];
  const accounts = accData?.data ?? [];

  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [captureMethod, setCaptureMethod] = useState<CaptureMethod | null>(null);
  const [formStep, setFormStep] = useState<'capture' | 'review'>('capture');
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [smsText, setSmsText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Set default category/account when data loads
  useEffect(() => {
    if (categories.length > 0 && !categoryId) setCategoryId(categories[0].id);
  }, [categories]);
  useEffect(() => {
    if (accounts.length > 0 && !accountId) setAccountId(accounts[0].id);
  }, [accounts]);

  const captureMethods = [
    { id: 'manual' as CaptureMethod, icon: Edit3, label: t('addTransaction.manual'), desc: t('addTransaction.manualDesc') },
    { id: 'sms' as CaptureMethod, icon: MessageSquare, label: t('addTransaction.sms'), desc: t('addTransaction.smsDesc') },
    { id: 'voice' as CaptureMethod, icon: Mic, label: t('addTransaction.voice'), desc: t('addTransaction.voiceDesc') },
    { id: 'scan' as CaptureMethod, icon: Camera, label: t('addTransaction.scan'), desc: t('addTransaction.scanDesc') },
  ];

  const handleContinue = () => {
    if (captureMethod === 'sms' && smsText) {
      setAmount('245.50');
      setMerchant('Carrefour');
    } else if (captureMethod === 'voice') {
      setAmount('32.00');
      setMerchant('Starbucks');
    } else if (captureMethod === 'scan') {
      setAmount('189.00');
      setMerchant('Amazon');
    }
    setFormStep('review');
  };

  const handleSave = async () => {
    if (!transactionType || !amount || !merchant) return;
    setIsSaving(true);
    try {
      await transactionsApi.createTransaction({
        type: transactionType,
        amount: Number(amount),
        merchant,
        categoryId: categoryId || undefined,
        accountId: accountId || undefined,
        method: captureMethod || 'manual',
        notes: notes || undefined,
        occurredAt: date,
      });
      router.back();
    } catch (err: any) {
      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1: Select type
  if (!transactionType) {
    return (
      <View className="flex-1 bg-white">
        <View style={{ paddingTop: insets.top }} className="px-4 pb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-slate-800">{t('addTransaction.title')}</Text>
          <Pressable onPress={() => router.back()} className="p-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44 }}>
            <X size={22} color="#1e293b" />
          </Pressable>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-slate-500 text-center mb-8">{t('addTransaction.selectType')}</Text>
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => setTransactionType('income')}
              className="flex-1 bg-emerald-50 rounded-2xl p-6 items-center active:bg-emerald-100"
              accessibilityRole="button"
              accessibilityLabel={t('addTransaction.income')}
            >
              <View className="w-14 h-14 bg-emerald-500 rounded-full items-center justify-center mb-3">
                <ArrowUpRight size={24} color="#ffffff" />
              </View>
              <Text className="text-emerald-700 font-semibold text-base">{t('addTransaction.income')}</Text>
            </Pressable>
            <Pressable
              onPress={() => setTransactionType('expense')}
              className="flex-1 bg-red-50 rounded-2xl p-6 items-center active:bg-red-100"
              accessibilityRole="button"
              accessibilityLabel={t('addTransaction.expense')}
            >
              <View className="w-14 h-14 bg-red-500 rounded-full items-center justify-center mb-3">
                <ArrowDownRight size={24} color="#ffffff" />
              </View>
              <Text className="text-red-700 font-semibold text-base">{t('addTransaction.expense')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Step 2: Select capture method
  if (!captureMethod) {
    return (
      <View className="flex-1 bg-white">
        <View style={{ paddingTop: insets.top }} className="px-4 pb-3 flex-row items-center">
          <Pressable onPress={() => setTransactionType(null)} className="p-2 -ml-2 mr-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Back" style={{ minHeight: 44 }}>
            <ArrowLeft size={22} color="#1e293b" />
          </Pressable>
          <Text className="text-lg font-bold text-slate-800">{t('addTransaction.title')}</Text>
          <View className="flex-1" />
          <Pressable onPress={() => router.back()} className="p-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44 }}>
            <X size={22} color="#1e293b" />
          </Pressable>
        </View>

        <View className="flex-1 px-4 pt-6">
          <Text className="text-slate-500 text-center mb-8">{t('addTransaction.selectMethod')}</Text>
          <View className="flex-row flex-wrap gap-3">
            {captureMethods.map((m) => {
              const Icon = m.icon;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setCaptureMethod(m.id)}
                  className="bg-slate-50 rounded-2xl p-4 items-center active:bg-slate-100"
                  style={{ width: '47%' }}
                  accessibilityRole="button"
                  accessibilityLabel={m.label}
                >
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
                    <Icon size={22} color="#059669" />
                  </View>
                  <Text className="text-slate-800 font-medium text-sm">{m.label}</Text>
                  <Text className="text-slate-400 text-xs text-center mt-0.5">{m.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  // Step 3: Capture / Form
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pb-3 flex-row items-center border-b border-slate-100">
        <Pressable
          onPress={() => {
            if (formStep === 'review') setFormStep('capture');
            else setCaptureMethod(null);
          }}
          className="p-2 -ml-2 mr-2"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{ minHeight: 44 }}
        >
          <ArrowLeft size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800">
          {formStep === 'capture' ? t('transactionForm.capture') : t('transactionForm.review')}
        </Text>
        <View className="flex-1" />
        <Pressable onPress={() => router.back()} className="p-2" hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ minHeight: 44 }}>
          <X size={22} color="#1e293b" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        {formStep === 'capture' && captureMethod === 'manual' && (
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.amount')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              accessibilityLabel={t('transactionForm.amount')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.merchant')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={merchant}
              onChangeText={setMerchant}
              placeholder={t('transactionForm.merchant')}
              placeholderTextColor="#94a3b8"
              accessibilityLabel={t('transactionForm.merchant')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full ${categoryId === cat.id ? 'bg-emerald-600' : 'bg-slate-100'}`}
                  >
                    <Text className={`text-sm ${categoryId === cat.id ? 'text-white font-medium' : 'text-slate-600'}`}>
                      {language === 'en' ? cat.nameEn : cat.nameAr}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.date')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              accessibilityLabel={t('transactionForm.date')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.notes')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={notes}
              onChangeText={setNotes}
              placeholder={t('transactionForm.notes')}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
              accessibilityLabel={t('transactionForm.notes')}
            />
          </View>
        )}

        {formStep === 'capture' && captureMethod === 'sms' && (
          <View>
            <Text className="text-slate-500 text-center mb-4">{t('addTransaction.smsDesc')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={smsText}
              onChangeText={setSmsText}
              placeholder={t('transactionForm.pasteSms')}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
              accessibilityLabel={t('transactionForm.pasteSms')}
            />
          </View>
        )}

        {formStep === 'capture' && captureMethod === 'voice' && (
          <View className="items-center pt-12">
            <Pressable
              onPress={() => setIsRecording(!isRecording)}
              className={`w-24 h-24 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-emerald-600'}`}
              accessibilityRole="button"
              accessibilityLabel={isRecording ? t('transactionForm.recording') : t('transactionForm.tapToRecord')}
            >
              <Mic size={36} color="#ffffff" />
            </Pressable>
            <Text className="text-slate-500 mt-4 text-sm">
              {isRecording ? t('transactionForm.recording') : t('transactionForm.tapToRecord')}
            </Text>
            {isRecording && (
              <View className="flex-row gap-1 mt-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className="w-1.5 bg-red-400 rounded-full"
                    style={{ height: 16 + Math.random() * 24 }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {formStep === 'capture' && captureMethod === 'scan' && (
          <View className="items-center pt-8">
            <View className="w-full aspect-[3/4] bg-slate-900 rounded-2xl items-center justify-center overflow-hidden">
              <View className="w-3/4 h-3/4 border-2 border-white/50 rounded-xl items-center justify-center">
                <Camera size={48} color="rgba(255,255,255,0.5)" />
                <Text className="text-white/60 mt-3 text-sm">{t('transactionForm.pointCamera')}</Text>
              </View>
            </View>
          </View>
        )}

        {formStep === 'review' && (
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.amount')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              accessibilityLabel={t('transactionForm.amount')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.merchant')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={merchant}
              onChangeText={setMerchant}
              accessibilityLabel={t('transactionForm.merchant')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full ${categoryId === cat.id ? 'bg-emerald-600' : 'bg-slate-100'}`}
                  >
                    <Text className={`text-sm ${categoryId === cat.id ? 'text-white font-medium' : 'text-slate-600'}`}>
                      {language === 'en' ? cat.nameEn : cat.nameAr}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.date')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={date}
              onChangeText={setDate}
              accessibilityLabel={t('transactionForm.date')}
            />

            <Text className="text-sm font-medium text-slate-700 mb-1.5">{t('transactionForm.notes')}</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
              accessibilityLabel={t('transactionForm.notes')}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {formStep === 'capture' && captureMethod === 'manual' ? (
          <Pressable
            onPress={() => setFormStep('review')}
            className="bg-emerald-600 py-4 rounded-xl items-center active:bg-emerald-700"
            accessibilityRole="button"
            accessibilityLabel={t('transactionForm.review')}
          >
            <Text className="text-white font-semibold">{t('transactionForm.review')}</Text>
          </Pressable>
        ) : formStep === 'capture' ? (
          <Pressable
            onPress={handleContinue}
            className="bg-emerald-600 py-4 rounded-xl items-center active:bg-emerald-700"
            accessibilityRole="button"
            accessibilityLabel={language === 'en' ? 'Continue' : 'متابعة'}
          >
            <Text className="text-white font-semibold">{language === 'en' ? 'Continue' : 'متابعة'}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className={`py-4 rounded-xl items-center flex-row justify-center ${isSaving ? 'bg-emerald-400' : 'bg-emerald-600 active:bg-emerald-700'}`}
            accessibilityRole="button"
            accessibilityLabel={t('transactionForm.save')}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={18} color="#ffffff" />
                <Text className="text-white font-semibold ml-2">{t('transactionForm.save')}</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
